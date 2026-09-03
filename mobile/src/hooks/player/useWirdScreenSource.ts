import { useCallback, useMemo } from 'react';
import { useCategory } from '@/hooks/hospital/useCategory';
import { useSubcategory } from '@/hooks/hospital/useSubcategory';
import { useDisease } from '@/hooks/hospital/useDisease';
import { useRecordings } from '@/hooks/hospital/useRecordings';
import type { AccessibleRecording } from '@/types/recording';
import { useFavorites } from '@/hooks/content/useFavorites';
import { useRefresh } from '@/hooks/common/useRefresh';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { selectIsPaid } from '@/store/slices/authSlice';
import { pickText } from '@/utils/formatters';
import { sortSummarizedFirst } from '@/utils/recordings';
import type {
  WirdScreenSource,
  WirdSourceKind,
  WirdSourceLevel,
} from '@/types/wird';

export function useWirdScreenSource(
  kind: WirdSourceKind,
  slug: string,
  level: WirdSourceLevel,
): WirdScreenSource {
  const { t, isArabic } = useLanguage();
  const isPaid = useAppSelector(selectIsPaid);
  const { isFavorited, toggleFavorite } = useFavorites();

  // ── Data sources (inactive ones disabled by empty input) ────────────────────
  const catQ = useCategory(kind === 'recordings' && level === 'category' ? slug : '');
  const subQ = useSubcategory(kind === 'recordings' && level === 'subcategory' ? slug : '');
  const diseaseQ = useDisease(kind === 'disease' ? slug : '');
  const diseaseId = kind === 'disease' ? diseaseQ.disease?.id ?? 0 : 0;
  const recordingsQ = useRecordings(diseaseId);

  // Recordings kind: category/subcategory return raw Recording[] — sort
  // (summarized first) and tag accessibility locally, mirroring useRecordings.
  const node = level === 'subcategory' ? subQ.subcategory : catQ.category;
  const rawRecordings = level === 'subcategory' ? subQ.recordings : catQ.recordings;
  const nodeRecordings = useMemo<AccessibleRecording[]>(() => {
    return sortSummarizedFirst(rawRecordings)
      .map((r) => ({ ...r, accessible: !r.requires_subscription || isPaid }));
  }, [rawRecordings, isPaid]);

  // Unified pull-to-refresh: disease refetches both its detail and recordings;
  // a node refetches just the active category/subcategory query.
  const refetch = useCallback(() => {
    if (kind === 'disease') return Promise.all([diseaseQ.refetch(), recordingsQ.refetch()]);
    return level === 'subcategory' ? subQ.refetch() : catQ.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depends only on the stable .refetch functions, not the query result objects (which change on every isLoading/data update)
  }, [kind, level, diseaseQ.refetch, recordingsQ.refetch, subQ.refetch, catQ.refetch]);
  const { refreshing, onRefresh } = useRefresh(refetch);

  if (kind === 'disease') {
    const disease = diseaseQ.disease;
    return {
      title: disease ? pickText(disease.name, isArabic) : t.hospital.diseases,
      recordings: recordingsQ.recordings,
      contextId: diseaseId,
      isLoading: diseaseQ.isLoading,
      error: diseaseQ.error,
      hasEntity: !!disease,
      refreshing,
      onRefresh,
      favorited: !!disease && isFavorited(disease.id),
      onToggleFavorite: () => { if (disease) toggleFavorite(disease); },
      supportsAlert: true,
      emptyText: t.disease.noRecordings,
    };
  }

  // Recordings kind (direct category / subcategory node).
  const activeCat = level === 'subcategory' ? subQ : catQ;
  const favoriteRoute =
    level === 'subcategory'
      ? `/hospital/recordings/${slug}?level=subcategory`
      : `/hospital/recordings/${slug}`;
  return {
    title: node ? pickText(node.name, isArabic) : t.hospital.title,
    recordings: nodeRecordings,
    contextId: node?.id ?? 0,
    isLoading: activeCat.isLoading,
    error: activeCat.error,
    hasEntity: !!node,
    refreshing,
    onRefresh,
    favorited: !!node && isFavorited(node.id, level),
    onToggleFavorite: () => { if (node) toggleFavorite(node, level, favoriteRoute); },
    supportsAlert: false,
    emptyText: t.disease.noRecordings,
  };
}
