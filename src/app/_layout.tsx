import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { AddTodoModal } from '@/components/AddTodoModal';
import { ThemeSelectorModal } from '@/components/ThemeSelectorModal';
import {
  saveThemeToStorage,
  saveTodosToStorage,
  saveUseTodayDateToStorage,
} from '@/services/todoStorage';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createTodoAsync,
  hydrateFromStorage,
  selectActivePaletteId,
  selectCurrentTheme,
  selectIsAddModalOpen,
  selectIsStorageHydrated,
  selectIsThemeModalOpen,
  selectTodos,
  selectUseTodayDate,
  setActivePaletteId,
  setIsAddModalOpen,
  setIsThemeModalOpen,
} from '@/store/todoSlice';
import { TodoFormData } from '@/types/todo';

function TodoAppShell() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectTodos);
  const activePaletteId = useAppSelector(selectActivePaletteId);
  const useTodayDate = useAppSelector(selectUseTodayDate);
  const isStorageHydrated = useAppSelector(selectIsStorageHydrated);
  const isAddModalOpen = useAppSelector(selectIsAddModalOpen);
  const isThemeModalOpen = useAppSelector(selectIsThemeModalOpen);
  const currentTheme = useAppSelector(selectCurrentTheme);

  useEffect(() => {
    void dispatch(hydrateFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    void saveTodosToStorage(todos);
  }, [todos, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    void saveThemeToStorage(activePaletteId);
  }, [activePaletteId, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    void saveUseTodayDateToStorage(useTodayDate);
  }, [useTodayDate, isStorageHydrated]);

  const handleAddTodo = (formData: TodoFormData) => {
    void dispatch(createTodoAsync(formData));
  };

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#08090C' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <AddTodoModal
        visible={isAddModalOpen}
        onClose={() => dispatch(setIsAddModalOpen(false))}
        onAdd={handleAddTodo}
        theme={currentTheme}
      />
      <ThemeSelectorModal
        visible={isThemeModalOpen}
        activePaletteId={activePaletteId}
        onSelectPalette={(id) => dispatch(setActivePaletteId(id))}
        onClose={() => dispatch(setIsThemeModalOpen(false))}
      />
    </>
  );
}

/**
 * Root Expo Router layout wrapping the app in SafeAreaProvider and Redux Provider.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <TodoAppShell />
      </Provider>
    </SafeAreaProvider>
  );
}
