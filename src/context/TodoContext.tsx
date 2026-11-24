import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Todo, TodoFormData } from '@/types/todo';
import {
  MaterialYouPalette,
  MaterialYouPaletteId,
  MATERIAL_YOU_PALETTES,
} from '@/constants/theme';
import {
  addTodoApi,
  deleteTodoApi,
  fetchTodos,
  toggleTodoApi,
} from '@/services/todoApi';
import { AddTodoModal } from '@/components/AddTodoModal';
import { ThemeSelectorModal } from '@/components/ThemeSelectorModal';
import { triggerHaptic, triggerNotificationHaptic } from '@/utils/haptics';

interface TodoContextValue {
  activePaletteId: MaterialYouPaletteId;
  setActivePaletteId: (id: MaterialYouPaletteId) => void;
  currentTheme: MaterialYouPalette;
  todos: Todo[];
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchVisible: boolean;
  setIsSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
  useTodayDate: boolean;
  setUseTodayDate: React.Dispatch<React.SetStateAction<boolean>>;
  currentDateText: string;
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  progressPercent: number;
  openAddModal: () => void;
  openThemeModal: () => void;
  handleLoadFromApi: (isRefresh?: boolean) => Promise<void>;
  handleClearAll: () => void;
  handleToggle: (id: number) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleAddTodo: (formData: TodoFormData) => Promise<void>;
}

const TodoContext = createContext<TodoContextValue | null>(null);

function getFormattedDate(): string {
  const d = new Date();
  const day = d.getDate();
  const suffix = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${day}${suffix(day)} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Provides shared todo state, Material You theme selection, and global modals
 * across all Expo Router tabs.
 */
export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [activePaletteId, setActivePaletteId] =
    useState<MaterialYouPaletteId>('ocean');
  const currentTheme = MATERIAL_YOU_PALETTES[activePaletteId];
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [useTodayDate, setUseTodayDate] = useState(false);
  const currentDateText = useTodayDate ? getFormattedDate() : '4th March 2018';

  const totalCount = todos.length;
  const completedCount = useMemo(
    () => todos.filter((t) => t.completed).length,
    [todos]
  );
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? completedCount / totalCount : 0;

  const handleLoadFromApi = useCallback(async (isRefresh = false) => {
    try {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchTodos(30, 0);
      setTodos(data.todos);
      triggerNotificationHaptic(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Помилка', 'Не вдалося завантажити завдання із сервера');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleClearAll = useCallback(() => {
    if (todos.length === 0) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Очистити список', 'Видалити всі завдання зі списку?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити всі',
        style: 'destructive',
        onPress: () => {
          triggerNotificationHaptic(Haptics.NotificationFeedbackType.Warning);
          setTodos([]);
        },
      },
    ]);
  }, [todos.length]);

  const handleToggle = useCallback(
    async (id: number) => {
      const target = todos.find((t) => t.id === id);
      const nextCompleted = target ? !target.completed : true;

      setTodos((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                completed: !item.completed,
                status: !item.completed ? 'done' : 'to-do',
              }
            : item
        )
      );

      if (target) {
        await toggleTodoApi(id, nextCompleted);
      }
    },
    [todos]
  );

  const handleDelete = useCallback(async (id: number) => {
    setTodos((prev) => prev.filter((item) => item.id !== id));
    await deleteTodoApi(id);
  }, []);

  const handleAddTodo = useCallback(async (formData: TodoFormData) => {
    const tempId = Date.now();
    const taskStatus = formData.status || 'to-do';
    const isCompleted = taskStatus === 'done';
    const newTodo: Todo = {
      id: tempId,
      todo: formData.title,
      completed: isCompleted,
      status: taskStatus,
      date: formData.date,
      priority: formData.priority,
      userId: 1,
      time: '12 pm',
    };
    setTodos((prev) => [newTodo, ...prev]);

    try {
      const serverTodo = await addTodoApi(formData);
      setTodos((prev) =>
        prev.map((t) => (t.id === tempId ? { ...t, id: serverTodo.id } : t))
      );
    } catch (e) {
      console.warn('Local fallback used for added todo:', e);
    }
  }, []);

  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const openThemeModal = useCallback(() => {
    setIsThemeModalOpen(true);
  }, []);

  const value = useMemo<TodoContextValue>(
    () => ({
      activePaletteId,
      setActivePaletteId,
      currentTheme,
      todos,
      loading,
      refreshing,
      searchQuery,
      setSearchQuery,
      isSearchVisible,
      setIsSearchVisible,
      useTodayDate,
      setUseTodayDate,
      currentDateText,
      totalCount,
      completedCount,
      pendingCount,
      progressPercent,
      openAddModal,
      openThemeModal,
      handleLoadFromApi,
      handleClearAll,
      handleToggle,
      handleDelete,
      handleAddTodo,
    }),
    [
      activePaletteId,
      currentTheme,
      todos,
      loading,
      refreshing,
      searchQuery,
      isSearchVisible,
      useTodayDate,
      currentDateText,
      totalCount,
      completedCount,
      pendingCount,
      progressPercent,
      openAddModal,
      openThemeModal,
      handleLoadFromApi,
      handleClearAll,
      handleToggle,
      handleDelete,
      handleAddTodo,
    ]
  );

  return (
    <TodoContext.Provider value={value}>
      {children}
      <AddTodoModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTodo}
        theme={currentTheme}
      />
      <ThemeSelectorModal
        visible={isThemeModalOpen}
        activePaletteId={activePaletteId}
        onSelectPalette={setActivePaletteId}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </TodoContext.Provider>
  );
}

/**
 * Returns the shared todo state and actions from TodoProvider.
 */
export function useTodoContext(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('useTodoContext must be used inside TodoProvider');
  }
  return ctx;
}
