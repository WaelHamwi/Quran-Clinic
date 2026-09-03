import * as SQLite from 'expo-sqlite';
import type { Surah } from '@/types/surah';
import type { Translatable } from '@/types/translatable';
import type { Verse } from '@/types/verse';
import type { Recitation } from '@/types/recitation';

export interface VerseTimingRow {
  timestampFrom: number;
  timestampTo: number;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  // v2 database — translatable fields are stored as JSON ({ ar, en }).
  db = await SQLite.openDatabaseAsync('quran_v2.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS surahs (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      transliteration TEXT NOT NULL,
      type TEXT NOT NULL,
      total_verses INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY,
      surah_id INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY(surah_id) REFERENCES surahs(id)
    );
    CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surah_id, verse_number);
    CREATE TABLE IF NOT EXISTS verse_timings (
      surah_id INTEGER NOT NULL,
      recitation_id INTEGER NOT NULL,
      verse_index INTEGER NOT NULL,
      timestamp_from INTEGER NOT NULL,
      timestamp_to INTEGER NOT NULL,
      PRIMARY KEY (surah_id, recitation_id, verse_index)
    );
    CREATE TABLE IF NOT EXISTS verse_timing_audio (
      surah_id INTEGER NOT NULL,
      recitation_id INTEGER NOT NULL,
      audio_url TEXT NOT NULL,
      PRIMARY KEY (surah_id, recitation_id)
    );
    CREATE TABLE IF NOT EXISTS recitations (
      id INTEGER PRIMARY KEY,
      reciter_id INTEGER NOT NULL,
      surah_id INTEGER NOT NULL,
      audio_url TEXT NOT NULL,
      duration_seconds REAL,
      reciter_json TEXT
    );
  `);

  return db;
}

function parseTranslatable(raw: string): Translatable {
  try {
    return JSON.parse(raw) as Translatable;
  } catch {
    return { ar: raw };
  }
}

// Multi-row INSERT batches: one statement per chunk instead of one per row
// (286 sequential statements for Al-Baqarah caused visible jank and the
// "database is locked" contention on first launch). Chunk size × column count
// must stay under SQLite's 999-variable limit.
async function batchInsert(
  database: SQLite.SQLiteDatabase,
  table: string,
  columns: string[],
  rows: SQLite.SQLiteBindValue[][],
): Promise<void> {
  if (rows.length === 0) return;
  const chunkSize = Math.floor(900 / columns.length);
  const placeholder = `(${columns.map(() => '?').join(', ')})`;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await database.runAsync(
      `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES ${chunk
        .map(() => placeholder)
        .join(', ')}`,
      chunk.flat(),
    );
  }
}

export async function saveSurahs(surahs: Surah[]): Promise<void> {
  const database = await initDatabase();
  await database.withTransactionAsync(async () => {
    await batchInsert(
      database,
      'surahs',
      ['id', 'name', 'transliteration', 'type', 'total_verses'],
      surahs.map((s) => [s.id, JSON.stringify(s.name), s.transliteration, s.type, s.total_verses]),
    );
  });
}

export async function getSurahs(): Promise<Surah[]> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{
    id: number;
    name: string;
    transliteration: string;
    type: 'meccan' | 'medinan';
    total_verses: number;
  }>('SELECT * FROM surahs ORDER BY id');
  return rows.map((r) => ({
    id: r.id,
    name: parseTranslatable(r.name),
    transliteration: r.transliteration,
    type: r.type,
    total_verses: r.total_verses,
  }));
}

export async function saveVerses(verses: Verse[]): Promise<void> {
  const database = await initDatabase();
  await database.withTransactionAsync(async () => {
    await batchInsert(
      database,
      'verses',
      ['id', 'surah_id', 'verse_number', 'text'],
      verses.map((v) => [v.id, v.surah_id, v.verse_number, JSON.stringify(v.text)]),
    );
  });
}

export async function getVersesBySurah(surahId: number): Promise<Verse[]> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{
    id: number;
    surah_id: number;
    verse_number: number;
    text: string;
  }>('SELECT * FROM verses WHERE surah_id = ? ORDER BY verse_number', [surahId]);
  return rows.map((r) => ({
    id: r.id,
    surah_id: r.surah_id,
    verse_number: r.verse_number,
    text: parseTranslatable(r.text),
  }));
}

/**
 * Word search across whatever surahs have already been cached locally (FR-16.1
 * offline fallback) — LIKE against the raw JSON text column, same tolerance level
 * as the backend's own LIKE fallback search. Only covers surahs the user has
 * actually opened while online; it can't search verses never downloaded.
 */
export async function searchVersesCached(term: string, limit = 20, offset = 0): Promise<Verse[]> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{
    id: number;
    surah_id: number;
    verse_number: number;
    text: string;
  }>('SELECT * FROM verses WHERE text LIKE ? LIMIT ? OFFSET ?', [`%${term}%`, limit, offset]);
  return rows.map((r) => ({
    id: r.id,
    surah_id: r.surah_id,
    verse_number: r.verse_number,
    text: parseTranslatable(r.text),
  }));
}

export async function isSurahListCached(): Promise<boolean> {
  const database = await initDatabase();
  const result = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM surahs');
  return (result?.count ?? 0) > 0;
}

export async function isSurahVersesCached(surahId: number): Promise<boolean> {
  const database = await initDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM verses WHERE surah_id = ?',
    [surahId]
  );
  return (result?.count ?? 0) > 0;
}

export async function saveVerseTiming(
  surahId: number,
  recitationId: number,
  timings: VerseTimingRow[],
  audioUrl: string | null
): Promise<void> {
  const database = await initDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      'DELETE FROM verse_timings WHERE surah_id = ? AND recitation_id = ?',
      [surahId, recitationId]
    );
    await batchInsert(
      database,
      'verse_timings',
      ['surah_id', 'recitation_id', 'verse_index', 'timestamp_from', 'timestamp_to'],
      timings.map((t, i) => [surahId, recitationId, i, t.timestampFrom, t.timestampTo]),
    );
    if (audioUrl) {
      await database.runAsync(
        'INSERT OR REPLACE INTO verse_timing_audio (surah_id, recitation_id, audio_url) VALUES (?, ?, ?)',
        [surahId, recitationId, audioUrl]
      );
    } else {
      await database.runAsync(
        'DELETE FROM verse_timing_audio WHERE surah_id = ? AND recitation_id = ?',
        [surahId, recitationId]
      );
    }
  });
}

export async function getVerseTiming(
  surahId: number,
  recitationId: number
): Promise<{ timings: VerseTimingRow[]; audioUrl: string | null }> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{ timestamp_from: number; timestamp_to: number }>(
    'SELECT timestamp_from, timestamp_to FROM verse_timings WHERE surah_id = ? AND recitation_id = ? ORDER BY verse_index',
    [surahId, recitationId]
  );
  const urlRow = await database.getFirstAsync<{ audio_url: string }>(
    'SELECT audio_url FROM verse_timing_audio WHERE surah_id = ? AND recitation_id = ?',
    [surahId, recitationId]
  );
  return {
    timings: rows.map((r) => ({ timestampFrom: r.timestamp_from, timestampTo: r.timestamp_to })),
    audioUrl: urlRow?.audio_url ?? null,
  };
}

export async function saveRecitations(recitations: Recitation[]): Promise<void> {
  const database = await initDatabase();
  await database.withTransactionAsync(async () => {
    await batchInsert(
      database,
      'recitations',
      ['id', 'reciter_id', 'surah_id', 'audio_url', 'duration_seconds', 'reciter_json'],
      recitations.map((r) => [
        r.id,
        r.reciter_id,
        r.surah_id,
        r.audio_url,
        r.duration_seconds ?? null,
        r.reciter ? JSON.stringify(r.reciter) : null,
      ]),
    );
  });
}

export async function getRecitationsBySurah(surahId: number): Promise<Recitation[]> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{
    id: number;
    reciter_id: number;
    surah_id: number;
    audio_url: string;
    duration_seconds: number | null;
    reciter_json: string | null;
  }>('SELECT * FROM recitations WHERE surah_id = ?', [surahId]);
  return rows.map((r) => ({
    id: r.id,
    reciter_id: r.reciter_id,
    surah_id: r.surah_id,
    audio_path: '',
    audio_url: r.audio_url,
    duration_seconds: r.duration_seconds,
    reciter: r.reciter_json ? JSON.parse(r.reciter_json) : undefined,
  }));
}

export async function clearAll(): Promise<void> {
  const database = await initDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM verse_timings');
    await database.runAsync('DELETE FROM verse_timing_audio');
    await database.runAsync('DELETE FROM recitations');
    await database.runAsync('DELETE FROM verses');
    await database.runAsync('DELETE FROM surahs');
  });
}

export const offlineStorage = {
  initDatabase,
  saveSurahs,
  getSurahs,
  saveVerses,
  getVersesBySurah,
  searchVersesCached,
  isSurahListCached,
  isSurahVersesCached,
  saveVerseTiming,
  getVerseTiming,
  saveRecitations,
  getRecitationsBySurah,
  clearAll,
};
