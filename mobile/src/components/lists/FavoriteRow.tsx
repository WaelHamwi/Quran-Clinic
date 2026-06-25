import React, { useCallback } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RemoteSvg } from '@/components/common/RemoteSvg';
import { useLanguage } from '@/context/LanguageContext';
import { pickText } from '@/utils/formatters';
import type { FavoriteItem } from '@/store/slices/favoritesSlice';
import {
  favoriteRowStyles as s,
  ICON_COLOR,
  HANDLE_COLOR,
  CHEVRON_COLOR,
} from './FavoriteRow.styles';

interface FavoriteRowProps {
  favorite: FavoriteItem;
  onPress: (route: string) => void;
  /** Touch handlers (from a PanResponder) attached to the drag handle so the row
   *  can be dragged to reorder. When omitted, the handle is inert. */
  dragHandleProps?: ViewProps;
  /** True while this row is the one being dragged — raises it visually. */
  isActive?: boolean;
}

function FavoriteRowBase({ favorite, onPress, dragHandleProps, isActive }: FavoriteRowProps) {
  const { isArabic, t } = useLanguage();
  const handlePress = useCallback(() => onPress(favorite.route), [onPress, favorite.route]);

  const iconIsUrl = !!favorite.icon && /^https?:\/\//.test(favorite.icon);
  const iconIsSvg = iconIsUrl && /\.svg($|\?)/i.test(favorite.icon as string);

  // Subtitle: the section (subcategory → category), falling back to the
  // recording count when relations aren't present on the favorited object.
  const sectionName = favorite.subcategory?.name ?? favorite.category?.name ?? null;
  const count = favorite.recordings_count ?? favorite.recordings?.length ?? 0;
  const subtitle = sectionName ? pickText(sectionName, isArabic) : t.hospital.recordingCount(count);

  const iconBubble = (
    <View style={s.row__iconBubble}>
      {iconIsSvg ? (
        <RemoteSvg uri={favorite.icon as string} width={32} height={32} color={ICON_COLOR} />
      ) : iconIsUrl ? (
        <Image
          source={{ uri: favorite.icon as string, headers: { 'ngrok-skip-browser-warning': 'true' } }}
          style={s.row__iconImage}
          contentFit="contain"
          tintColor={ICON_COLOR}
        />
      ) : (
        <Ionicons name="pulse-outline" size={32} color={ICON_COLOR} />
      )}
    </View>
  );

  const texts = (
    <View style={[s.row__texts, { alignItems: isArabic ? 'flex-end' : 'flex-start' }]}>
      <Text style={[s.row__title, { textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={1}>
        {pickText(favorite.name, isArabic)}
      </Text>
      <Text style={[s.row__subtitle, { textAlign: isArabic ? 'right' : 'left' }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );

  const handle = (
    <View {...dragHandleProps} hitSlop={10} style={s.row__handle}>
      <Ionicons name="reorder-three" size={24} color={HANDLE_COLOR} />
    </View>
  );
  const chevron = (
    <Ionicons
      name={isArabic ? 'chevron-back' : 'chevron-forward'}
      size={16}
      color={CHEVRON_COLOR}
    />
  );

  // Figma 18284:3426 (RTL, right→left): handle · icon bubble · text … chevron.
  // The handle sits at the leading edge; the chevron alone at the trailing edge.
  const inner = (
    <View style={[s.row__inner, { flexDirection: 'row' }]}>
      {isArabic ? (
        <>
          {texts}
          {iconBubble}
        </>
      ) : (
        <>
          {iconBubble}
          {texts}
        </>
      )}
    </View>
  );

  const content = (
    <View style={[s.row__content, { flexDirection: 'row' }]}>
      {isArabic ? (
        <>
          {inner}
          {handle}
        </>
      ) : (
        <>
          {handle}
          {inner}
        </>
      )}
    </View>
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        s.row,
        { flexDirection: 'row' },
        pressed && s['row--pressed'],
        isActive && s['row--active'],
      ]}
    >
      {isArabic ? (
        <>
          {chevron}
          {content}
        </>
      ) : (
        <>
          {content}
          {chevron}
        </>
      )}
    </Pressable>
  );
}

function areEqual(prev: FavoriteRowProps, next: FavoriteRowProps): boolean {
  return (
    prev.favorite.id === next.favorite.id &&
    prev.favorite.favoriteKind === next.favorite.favoriteKind &&
    prev.favorite.icon === next.favorite.icon &&
    prev.onPress === next.onPress &&
    prev.dragHandleProps === next.dragHandleProps &&
    prev.isActive === next.isActive
  );
}

export const FavoriteRow = React.memo(FavoriteRowBase, areEqual);
