import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { SvgProps } from 'react-native-svg';
import TabHospital from '@/assets/figma/tab-hospital.svg';
import TabLearn from '@/assets/figma/tab-learn.svg';
import TabAsk from '@/assets/figma/tab-ask.svg';
import TabFav from '@/assets/figma/tab-fav.svg';
import TabMore from '@/assets/figma/tab-more.svg';
import { MiniPlayer } from '@/components/players/MiniPlayer';
import { tabBarStyles as s, ICON_ACTIVE, ICON_INACTIVE } from './TabBar.styles';

const ICONS: Record<string, React.FC<SvgProps>> = {
  index: TabHospital,
  mushaf: TabLearn,
  askme: TabAsk,
  favorites: TabFav,
  more: TabMore,
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.tabBar}>
      <MiniPlayer />
      <View style={[s.tabBar__bar, { paddingBottom: 12 + insets.bottom }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = typeof options.title === 'string' ? options.title : route.name;
          const Icon = ICONS[route.name] ?? ICONS.index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const tint = focused ? ICON_ACTIVE : ICON_INACTIVE;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[s.tabBar__tab, focused && s['tabBar__tab--active']]}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
            >
              <View style={s.tabBar__icon}>
                <Icon width="100%" height="100%" color={tint} />
              </View>
              <Text
                style={[s.tabBar__label, focused && s['tabBar__label--active']]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
