import React from 'react';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useLanguage } from '@/context/LanguageContext';
import { useFeatureVisibility } from '@/hooks/common/useFeatures';
import { FEATURE_KEYS } from '@/constants/features';
import { TabBar } from '@/components/layout/TabBar';

/** `href: null` removes a tab from the navigator (and our custom `TabBar`). */
const hidden = (visible: boolean) => (visible ? undefined : null);

export function TabsLayout() {
  const { t } = useLanguage();
  const isVisible = useFeatureVisibility();

  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="more" options={{ title: t.tabs.more }} />
      <Tabs.Screen name="favorites" options={{ title: t.tabs.favorites }} />
      <Tabs.Screen
        name="askme"
        options={{ title: t.tabs.askMe, href: hidden(isVisible(FEATURE_KEYS.ASK_ME)) }}
      />
      <Tabs.Screen
        name="mushaf"
        options={{ title: t.tabs.mushaf, href: hidden(isVisible(FEATURE_KEYS.MUSHAF)) }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: t.tabs.home, href: hidden(isVisible(FEATURE_KEYS.HOSPITAL)) }}
      />
    </Tabs>
  );
}
