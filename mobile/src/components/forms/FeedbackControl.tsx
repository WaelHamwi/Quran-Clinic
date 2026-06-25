import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/common/Button';

interface FeedbackControlProps {
  onSubmit: (payload: { useful: boolean; comment: string }) => void;
  submitted?: boolean;
}

/** "Was this useful? Yes / No" + optional comment. */
function FeedbackControlBase({ onSubmit, submitted = false }: FeedbackControlProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [useful, setUseful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = useCallback(() => {
    if (useful === null) return;
    onSubmit({ useful, comment: comment.trim() });
  }, [useful, comment, onSubmit]);

  if (submitted) {
    return (
      <View style={styles.thanks}>
        <Ionicons name="heart" size={18} color={theme.primary} />
        <Text style={styles.thanksText}>{t.disease.feedbackThanks}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.disease.feedbackTitle}</Text>
      <View style={styles.choices}>
        <Pressable
          onPress={() => setUseful(true)}
          style={[styles.choice, useful === true && styles.choiceActive]}
        >
          <Ionicons
            name="thumbs-up"
            size={16}
            color={useful === true ? '#fff' : theme.textSecondary}
          />
          <Text style={[styles.choiceText, useful === true && styles.choiceTextActive]}>
            {t.disease.helpful}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setUseful(false)}
          style={[styles.choice, useful === false && styles.choiceActive]}
        >
          <Ionicons
            name="thumbs-down"
            size={16}
            color={useful === false ? '#fff' : theme.textSecondary}
          />
          <Text style={[styles.choiceText, useful === false && styles.choiceTextActive]}>
            {t.disease.notHelpful}
          </Text>
        </Pressable>
      </View>
      {useful !== null ? (
        <>
          <TextField
            value={comment}
            onChangeText={setComment}
            placeholder={t.disease.commentPlaceholder}
            multiline
          />
          <Button title={t.disease.submitFeedback} onPress={handleSubmit} />
        </>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { gap: spacing.md },
    title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: theme.text },
    choices: { flexDirection: 'row', gap: spacing.md },
    choice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    choiceActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    choiceText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: theme.textSecondary },
    choiceTextActive: { color: '#fff' },
    thanks: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
    thanksText: { fontSize: fontSize.md, color: theme.text, fontWeight: fontWeight.medium },
  });
}

export const FeedbackControl = React.memo(FeedbackControlBase);
