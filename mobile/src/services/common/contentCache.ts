import * as SQLite from 'expo-sqlite';

/**
 * Lightweight key/value SQLite cache for adhkar & tahsinat text — used for
 * offline fallback (RULE_35). Deliberately a SEPARATE database from the
 * Mushaf's `offlineStorage` so the existing Quran cache is never touched.
 */
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('content_cache_v1.db').then(async (db) => {
      await db.execAsync(
        'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);',
      );
      return db;
    });
  }
  return dbPromise;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', key, JSON.stringify(value));
  } catch {
    // Cache write failures are non-fatal.
  }
}

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key);
    return row ? (JSON.parse(row.value) as T) : null;
  } catch {
    return null;
  }
}

export const contentCache = { setItem, getItem };

/**
 * API-first fetch with SQLite fallback — mirrors the Mushaf `useSurah` pattern.
 * On success the result is cached; on failure the last cached copy is returned.
 */
export async function cachedFetch<T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const data = await fetcher();
    void contentCache.setItem(cacheKey, data);
    return data;
  } catch (error) {
    const cached = await contentCache.getItem<T>(cacheKey);
    if (cached !== null) return cached;
    throw error;
  }
}
