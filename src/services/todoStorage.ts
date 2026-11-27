import AsyncStorage from '@react-native-async-storage/async-storage';

import { MATERIAL_YOU_PALETTES, MaterialYouPaletteId } from '@/constants/theme';
import { Todo } from '@/types/todo';

const STORAGE_KEYS = {
  TODOS: '@todo_list/todos',
  THEME_PALETTE: '@todo_list/theme_palette',
  USE_TODAY_DATE: '@todo_list/use_today_date',
} as const;

function isValidTodo(item: unknown): item is Todo {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.todo === 'string' &&
    typeof candidate.completed === 'boolean' &&
    (candidate.status === 'to-do' || candidate.status === 'done') &&
    typeof candidate.date === 'string' &&
    (candidate.priority === 'low' ||
      candidate.priority === 'medium' ||
      candidate.priority === 'high') &&
    typeof candidate.userId === 'number'
  );
}

/**
 * Loads saved todos from AsyncStorage. Returns `null` if no data has been stored yet.
 */
export async function loadTodosFromStorage(): Promise<Todo[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return parsed.filter(isValidTodo);
  } catch (error) {
    console.error('Failed to load todos from AsyncStorage:', error);
    return null;
  }
}

/**
 * Persists the current todos list to AsyncStorage.
 */
export async function saveTodosToStorage(todos: Todo[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos to AsyncStorage:', error);
  }
}

/**
 * Loads the persisted Material You palette ID from AsyncStorage.
 */
export async function loadThemeFromStorage(): Promise<MaterialYouPaletteId | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PALETTE);
    if (raw && raw in MATERIAL_YOU_PALETTES) {
      return raw as MaterialYouPaletteId;
    }
    return null;
  } catch (error) {
    console.error('Failed to load theme from AsyncStorage:', error);
    return null;
  }
}

/**
 * Persists the selected Material You palette ID to AsyncStorage.
 */
export async function saveThemeToStorage(
  paletteId: MaterialYouPaletteId
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_PALETTE, paletteId);
  } catch (error) {
    console.error('Failed to save theme to AsyncStorage:', error);
  }
}

/**
 * Loads the persisted date-display toggle preference from AsyncStorage.
 */
export async function loadUseTodayDateFromStorage(): Promise<boolean | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USE_TODAY_DATE);
    if (raw === null) return null;
    return raw === 'true';
  } catch (error) {
    console.error('Failed to load date preference from AsyncStorage:', error);
    return null;
  }
}

/**
 * Persists the date-display toggle preference to AsyncStorage.
 */
export async function saveUseTodayDateToStorage(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USE_TODAY_DATE, String(value));
  } catch (error) {
    console.error('Failed to save date preference to AsyncStorage:', error);
  }
}
