import React, { useCallback, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, SectionList, Text, UIManager, View, type SectionListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { FAQ_SECTIONS, type FaqItem, type FaqSection } from '@/data/faq';
import { createStyles } from '@/styles/faqScreen.styles';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Parses **bold** and @@verse@@ markers within answer text
const SEGMENT_RE = /(\*\*[^*]+\*\*|@@[^@]+@@)/;

interface FormattedAnswerProps {
  text: string;
  baseStyle: object;
  boldStyle: object;
  verseStyle: object;
}

function FormattedAnswer({ text, baseStyle, boldStyle, verseStyle }: FormattedAnswerProps) {
  const parts = text.split(SEGMENT_RE);
  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={i} style={boldStyle}>{part.slice(2, -2)}</Text>;
        }
        if (part.startsWith('@@') && part.endsWith('@@')) {
          return <Text key={i} style={verseStyle}>{part.slice(2, -2)}</Text>;
        }
        return part;
      })}
    </Text>
  );
}

interface FaqRowProps {
  item: FaqItem;
  isOpen: boolean;
  locale: 'ar' | 'en';
  onToggle: (id: string) => void;
}

function FaqRow({ item, isOpen, locale, onToggle }: FaqRowProps) {
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  return (
    <View style={s.itemWrapper}>
      <View style={s.item}>
        <Pressable
          onPress={() => onToggle(item.id)}
          style={({ pressed }) => [s.questionRow, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={theme.primary}
          />
          <Text style={s.questionText}>{item.question[locale]}</Text>
        </Pressable>
        {isOpen ? (
          <>
            <View style={s.divider} />
            <View style={s.answerContainer}>
              <FormattedAnswer
                text={item.answer[locale]}
                baseStyle={s.answerText}
                boldStyle={s.answerBold}
                verseStyle={s.answerVerse}
              />
              {item.highlight && (
                <View style={s.highlightBox}>
                  <Text style={s.highlightText}>{item.highlight[locale]}</Text>
                </View>
              )}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

export default function FaqScreen() {
  const { t, isArabic } = useLanguage();
  const s = useStyles(createStyles);
  const locale = isArabic ? 'ar' : 'en';

  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const renderItem = useCallback<SectionListRenderItem<FaqItem, FaqSection>>(
    ({ item }) => (
      <FaqRow
        item={item}
        isOpen={openId === item.id}
        locale={locale}
        onToggle={handleToggle}
      />
    ),
    [openId, locale, handleToggle],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: FaqSection }) => (
      <View style={s.sectionHeaderContainer}>
        <Text style={s.sectionHeader}>{section.title[locale]}</Text>
      </View>
    ),
    [locale, s],
  );

  const keyExtractor = useCallback((item: FaqItem) => item.id, []);

  return (
    <Screen>
      <PatternedBackground />
      <Header title={t.faq.title} showBack />
      {FAQ_SECTIONS.length === 0 ? (
        <EmptyState icon="help-circle-outline" title={t.faq.empty} />
      ) : (
        <SectionList
          sections={FAQ_SECTIONS}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          removeClippedSubviews={false}
          ItemSeparatorComponent={() => <View style={s.itemSeparator} />}
        />
      )}
    </Screen>
  );
}
