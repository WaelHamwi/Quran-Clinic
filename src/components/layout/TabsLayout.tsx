import React from 'react';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useLanguage } from '@/context/LanguageContext';
import { TabBar } from '@/components/layout/TabBar';

export function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="more" options={{ title: t.tabs.more }} />
      <Tabs.Screen name="favorites" options={{ title: t.tabs.favorites }} />
      <Tabs.Screen name="askme" options={{ title: t.tabs.askMe }} />
      <Tabs.Screen name="mushaf" options={{ title: t.tabs.mushaf }} />
      <Tabs.Screen name="index" options={{ title: t.tabs.home }} />
    </Tabs>
  );
}
