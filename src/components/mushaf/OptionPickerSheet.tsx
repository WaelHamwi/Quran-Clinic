import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme/colors';
import { optionPickerStyles as s } from './OptionPickerSheet.styles';

export type PickerOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: PickerOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

export function OptionPickerSheet<T extends string>({
  visible,
  onClose,
  title,
  options,
  selected,
  onSelect,
}: Props<T>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handleWrap}>
            <View style={s.handle} />
          </View>

          <View style={s.header}>
            <Text style={s.title}>{title}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color={palette.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={s.list}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[s.row, opt.value === selected && s.rowActive]}
                onPress={() => { onSelect(opt.value); onClose(); }}
                activeOpacity={0.75}
              >
                <Text style={[s.rowLabel, opt.value === selected && s.rowLabelActive]}>
                  {opt.label}
                </Text>
                {opt.value === selected && (
                  <Ionicons name="checkmark" size={18} color={palette.brand[500]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
