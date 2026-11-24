import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TodoProvider } from '@/context/TodoContext';

/**
 * Root Expo Router layout wrapping the app in SafeAreaProvider and TodoProvider.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TodoProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#08090C' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </TodoProvider>
    </SafeAreaProvider>
  );
}
