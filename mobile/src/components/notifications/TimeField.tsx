import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';
import { formatTimeDraft, normalizeTime } from '@/utils/timeInput';

interface TimeFieldProps {
  label: string;
  value: string;
  onShift: (delta: number) => void;
  onSet: (value: string) => void;
  onFocusScroll: () => void;
  editable: boolean;
}

export function TimeField({
  label,
  value,
  onShift,
  onSet,
  onFocusScroll,
  editable,
}: TimeFieldProps) {
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  // `draft` lets the user type freely; the committed value only changes on
  // blur/submit (or via the steppers). Keep it in sync while not editing.
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: keep the draft synced to the committed value while the user isn't actively editing
    if (!editing) setDraft(value);
  }, [value, editing]);

  const onChange = useCallback((text: string) => setDraft(formatTimeDraft(text)), []);
  const onFocus = useCallback(() => {
    setEditing(true);
    onFocusScroll();
  }, [onFocusScroll]);

  const commitDraft = useCallback((): string | null => {
    const normalized = normalizeTime(draft);
    if (normalized && normalized !== value) onSet(normalized);
    return normalized;
  }, [draft, onSet, value]);

  const commit = useCallback(() => {
    setEditing(false);
    setDraft(commitDraft() ?? value); // revert invalid input
  }, [commitDraft, value]);

  // There is no save button — a typed time is committed on blur. Leaving the
  // screen (hardware back / header back) can unmount the field before it blurs,
  // so flush the pending draft on unmount or the edit is silently lost.
  const flushRef = useRef(commitDraft);
  // eslint-disable-next-line react-hooks/refs -- always-fresh ref so the unmount-only cleanup sees the latest draft
  flushRef.current = commitDraft;
  useEffect(() => () => void flushRef.current(), []);

  const onStepDown = useCallback(() => onShift(-30), [onShift]);
  const onStepUp = useCallback(() => onShift(30), [onShift]);

  return (
    <View style={s.timeField}>
      <Text style={s.timeLabel}>{label}</Text>
      <View style={[s.timeInput, !editable && s.timeInputDisabled]}>
        {editable ? (
          <Pressable style={s.stepBtn} onPress={onStepDown} hitSlop={8}>
            <Ionicons name="remove" size={18} color={theme.primary} />
          </Pressable>
        ) : (
          <View style={s.stepBtn} />
        )}
        <View style={s.timeInputContent}>
          {editable ? (
            <TextInput
              style={[s.timeInputText, s.timeInputEditable]}
              value={draft}
              onChangeText={onChange}
              onFocus={onFocus}
              onBlur={commit}
              onSubmitEditing={commit}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={5}
              placeholder="--:--"
              placeholderTextColor={theme.textPlaceholder}
              selectTextOnFocus
            />
          ) : (
            <Text style={s.timeInputText}>{value}</Text>
          )}
          <Ionicons name="time-outline" size={18} color={theme.primary} />
        </View>
        {editable ? (
          <Pressable style={s.stepBtn} onPress={onStepUp} hitSlop={8}>
            <Ionicons name="add" size={18} color={theme.primary} />
          </Pressable>
        ) : (
          <View style={s.stepBtn} />
        )}
      </View>
    </View>
  );
}
