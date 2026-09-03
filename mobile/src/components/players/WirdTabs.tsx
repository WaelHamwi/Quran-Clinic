import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/diseaseScreen.styles';
import type { RecordingGroup } from '@/utils/recordings';
import type { AccessibleRecording } from '@/types/recording';

type Props = {
  /** One entry per type — never one per recording; see `groupByType`. */
  groups: RecordingGroup<AccessibleRecording>[];
  displayIndex: number;
  onSelect: (recording: AccessibleRecording) => void;
};

/**
 * Segmented type tabs — الرقية المختصرة / الرقية المطوّلة (Figma node 19214:3763).
 *
 * One tab per type however many recordings it holds; a tab per recording would
 * repeat the same caption, since the caption comes from the type.
 */
export function WirdTabs({ groups, displayIndex, onSelect }: Props) {
  const { t, isArabic } = useLanguage();
  const s = useStyles(createStyles);

  if (groups.length === 0) return null;

  return (
    <View style={s.tabsWrap}>
      <View style={[s.tabGroup, isArabic && s['tabGroup--rtl']]}>
        {groups.map((group, idx) => {
          const active = idx === displayIndex;
          const label =
            group.type === 'detailed' ? t.disease.typeDetailed : t.disease.typeSummarized;
          return (
            <Pressable
              key={group.type}
              style={[s.tab, active && s['tab--active']]}
              onPress={() => onSelect(group.recordings[0])}
            >
              <Text style={[s.tabText, active && s['tabText--active']]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
