import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import { tahsinatItemRowStyles as s } from './TahsinatItemRow.styles';
import type { TahsinatItem } from '@/types/tahsinat';

interface TahsinatItemRowProps {
  item: TahsinatItem;
  count: number;
  onCount: (id: number, repetitions: number) => void;
}

function TahsinatItemRowBase({ item, count, onCount }: TahsinatItemRowProps) {
  const { isArabic, t } = useLanguage();
  const [showHint, setShowHint] = useState(false);

  const done = count >= item.repetitions;
  const handleCount = useCallback(
    () => onCount(item.id, item.repetitions),
    [onCount, item.id, item.repetitions],
  );
  const toggleHint = useCallback(() => setShowHint((v) => !v), []);

  const label = pickText(item.label, isArabic);
  const text = pickText(item.text, true);
  const hint = pickText(item.hint, isArabic);
  const applicabilityLabel = {
    self: t.tahsinat.self,
    others: t.tahsinat.forOthers,
    both: t.tahsinat.both,
  }[item.applicability];

  return (
    <View style={[s.card, done && s.cardDone]}>
      <View style={s.headerRow}>
        {label ? (
          <View style={s.labelBadge}>
            <Text style={s.labelText}>{label}</Text>
          </View>
        ) : <View />}
        {applicabilityLabel ? (
          <Text style={s.applicabilityText}>{applicabilityLabel}</Text>
        ) : null}
      </View>

      {text ? <Text style={s.arabic}>{text}</Text> : null}

      <View style={s.actions}>
        <Pressable onPress={handleCount} style={[s.counter, done && s.counterDone]}>
          <Text style={[s.counterText, done && s.counterTextDone]}>
            {count} / {item.repetitions}
          </Text>
        </Pressable>

        {hint ? (
          <Pressable onPress={toggleHint} style={s.hintBtn}>
            <Text style={s.hintLabel}>{t.tahsinat.hint}</Text>
          </Pressable>
        ) : null}
      </View>

      {showHint && hint ? <Text style={s.hintText}>{hint}</Text> : null}
    </View>
  );
}

function areEqual(prev: TahsinatItemRowProps, next: TahsinatItemRowProps): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.count === next.count &&
    prev.onCount === next.onCount
  );
}

export const TahsinatItemRow = React.memo(TahsinatItemRowBase, areEqual);
