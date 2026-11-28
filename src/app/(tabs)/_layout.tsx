import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GLASS_TOKENS } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import {
  selectCompletedCount,
  selectCurrentTheme,
  selectTotalCount,
  selectUncompletedCount,
} from '@/store/todoSlice';
import { triggerSelectionHaptic } from '@/utils/haptics';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

function renderTabIcon(name: FeatherIconName) {
  function TabBarIcon({ color, size }: { color: unknown; size: number }) {
    return (
      <Feather
        name={name}
        size={size - 2}
        color={typeof color === 'string' ? color : '#7E8497'}
      />
    );
  }
  return TabBarIcon;
}

function formatBadgeCount(count: number): string | number | undefined {
  if (count <= 0) return undefined;
  return count > 99 ? '99+' : count;
}

/**
 * Bottom Tab Navigation layout using Expo Router JavaScript Tabs and Redux state.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const currentTheme = useAppSelector(selectCurrentTheme);
  const totalCount = useAppSelector(selectTotalCount);
  const pendingCount = useAppSelector(selectUncompletedCount);
  const completedCount = useAppSelector(selectCompletedCount);

  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          triggerSelectionHaptic();
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: '#7E8497',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor:
            Platform.OS === 'android'
              ? 'rgba(12, 14, 22, 0.92)'
              : 'rgba(12, 14, 22, 0.68)',
          borderTopWidth: 1,
          borderTopColor: GLASS_TOKENS.glassBorderHighlight,
          height: 58 + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={GLASS_TOKENS.blurIntensityHeader}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarBadgeStyle: {
          backgroundColor: currentTheme.primary,
          color: currentTheme.onPrimary,
          fontSize: 10,
          fontWeight: '800',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Всі',
          tabBarIcon: renderTabIcon('list'),
          tabBarBadge: formatBadgeCount(totalCount),
        }}
      />
      <Tabs.Screen
        name="pending"
        options={{
          title: 'В роботі',
          tabBarIcon: renderTabIcon('clock'),
          tabBarBadge: formatBadgeCount(pendingCount),
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '800',
          },
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: 'Виконані',
          tabBarIcon: renderTabIcon('check-circle'),
          tabBarBadge: formatBadgeCount(completedCount),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профіль',
          tabBarIcon: renderTabIcon('user'),
        }}
      />
    </Tabs>
  );
}
