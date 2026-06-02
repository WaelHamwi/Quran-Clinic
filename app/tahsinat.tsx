import React, { useCallback, useMemo, useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { SegmentedTabs } from '@/components/common/SegmentedTabs';
import { TahsinatList } from '@/components/lists/TahsinatList';
import { useTahsinatCategories, useTahsinatItems } from '@/hooks/useTahsinat';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';

export default function TahsinatScreen() {
  const { t, isArabic } = useLanguage();
  const { categories, isLoading: catsLoading, error: catsError, refetch } =
    useTahsinatCategories();
  const [activeSlug, setActiveSlug] = useState('');
  const effectiveSlug = activeSlug || categories[0]?.slug || '';
  const activeCategory = categories.find((c) => c.slug === effectiveSlug);
  const { items, isLoading: itemsLoading } = useTahsinatItems(
    effectiveSlug,
    activeCategory?.random_order ?? false,
  );
  const [counters, setCounters] = useState<Record<number, number>>({});

  const onCount = useCallback((id: number, reps: number) => {
    setCounters((c) => {
      const cur = c[id] ?? 0;
      return { ...c, [id]: cur >= reps ? 0 : cur + 1 };
    });
  }, []);

  const tabs = useMemo(
    () => categories.map((c) => ({ key: c.slug, label: pickText(c.name, isArabic) })),
    [categories, isArabic],
  );
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  let body: React.ReactNode;
  if (catsLoading) {
    body = <Loader fullScreen message={t.common.loading} />;
  } else if (catsError) {
    body = (
      <EmptyState
        icon="cloud-offline-outline"
        title={t.common.error}
        actionLabel={t.common.retry}
        onAction={handleRetry}
      />
    );
  } else {
    body = (
      <>
        <SegmentedTabs tabs={tabs} activeKey={effectiveSlug} onChange={setActiveSlug} />
        {itemsLoading ? (
          <Loader fullScreen message={t.common.loading} />
        ) : (
          <TahsinatList
            items={items}
            counters={counters}
            onCount={onCount}
            ListEmptyComponent={
              <EmptyState icon="shield-checkmark-outline" title={t.tahsinat.empty} />
            }
          />
        )}
      </>
    );
  }

  return (
    <Screen edges={['top']}>
      <Header title={t.tahsinat.title} />
      {body}
    </Screen>
  );
}
