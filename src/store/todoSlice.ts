import { Alert } from 'react-native';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Haptics from 'expo-haptics';

import { MATERIAL_YOU_PALETTES, MaterialYouPaletteId } from '@/constants/theme';
import {
  addTodoApi,
  deleteTodoApi,
  fetchTodos,
  toggleTodoApi,
} from '@/services/todoApi';
import {
  loadThemeFromStorage,
  loadTodosFromStorage,
  loadUseTodayDateFromStorage,
} from '@/services/todoStorage';
import { Todo, TodoFormData } from '@/types/todo';
import { triggerHaptic, triggerNotificationHaptic } from '@/utils/haptics';

export interface TodoState {
  todos: Todo[];
  /** Explicitly stored count of uncompleted tasks, kept in sync with todos. */
  uncompletedCount: number;
  isStorageHydrated: boolean;
  hasMutatedTodos: boolean;
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  isSearchVisible: boolean;
  activePaletteId: MaterialYouPaletteId;
  useTodayDate: boolean;
  isAddModalOpen: boolean;
  isThemeModalOpen: boolean;
}

function countUncompleted(todos: Todo[]): number {
  return todos.reduce((count, item) => (item.completed ? count : count + 1), 0);
}

const initialState: TodoState = {
  todos: [],
  uncompletedCount: 0,
  isStorageHydrated: false,
  hasMutatedTodos: false,
  loading: false,
  refreshing: false,
  searchQuery: '',
  isSearchVisible: false,
  activePaletteId: 'ocean',
  useTodayDate: false,
  isAddModalOpen: false,
  isThemeModalOpen: false,
};

interface HydratedPayload {
  todos: Todo[] | null;
  palette: MaterialYouPaletteId | null;
  useTodayDate: boolean | null;
}

export const hydrateFromStorage = createAsyncThunk<HydratedPayload>(
  'todos/hydrateFromStorage',
  async () => {
    const [todos, palette, useTodayDate] = await Promise.all([
      loadTodosFromStorage(),
      loadThemeFromStorage(),
      loadUseTodayDateFromStorage(),
    ]);
    return { todos, palette, useTodayDate };
  }
);

export const loadTodosFromApi = createAsyncThunk<
  Todo[],
  boolean | undefined,
  { rejectValue: string }
>('todos/loadFromApi', async (isRefresh = false, { rejectWithValue }) => {
  try {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    const data = await fetchTodos(30, 0);
    triggerNotificationHaptic(Haptics.NotificationFeedbackType.Success);
    return data.todos;
  } catch (err) {
    console.error(err);
    Alert.alert('Помилка', 'Не вдалося завантажити завдання із сервера');
    return rejectWithValue(
      err instanceof Error ? err.message : 'Failed to load todos'
    );
  }
});

export const createTodoAsync = createAsyncThunk<void, TodoFormData>(
  'todos/createTodoAsync',
  async (formData, { dispatch }) => {
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

    dispatch(addTodo(newTodo));

    try {
      const serverTodo = await addTodoApi(formData);
      dispatch(reconcileTodoId({ tempId, serverId: serverTodo.id }));
    } catch (e) {
      console.warn('Local fallback used for added todo:', e);
    }
  }
);

export const toggleTodoAsync = createAsyncThunk<
  void,
  number,
  { state: { todos: TodoState } }
>('todos/toggleTodoAsync', async (id, { dispatch, getState }) => {
  const target = getState().todos.todos.find((t) => t.id === id);
  const nextCompleted = target ? !target.completed : true;

  dispatch(toggleTodoStatus(id));

  if (target) {
    await toggleTodoApi(id, nextCompleted);
  }
});

export const deleteTodoAsync = createAsyncThunk<void, number>(
  'todos/deleteTodoAsync',
  async (id, { dispatch }) => {
    dispatch(deleteTodoById(id));
    await deleteTodoApi(id);
  }
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setTodos(state, action: PayloadAction<Todo[]>) {
      state.hasMutatedTodos = true;
      state.todos = action.payload;
      state.uncompletedCount = countUncompleted(state.todos);
    },
    addTodo(state, action: PayloadAction<Todo>) {
      state.hasMutatedTodos = true;
      state.todos.unshift(action.payload);
      state.uncompletedCount = countUncompleted(state.todos);
    },
    reconcileTodoId(
      state,
      action: PayloadAction<{ tempId: number; serverId: number }>
    ) {
      const { tempId, serverId } = action.payload;
      const idAlreadyExists = state.todos.some(
        (t) => t.id === serverId && t.id !== tempId
      );
      if (idAlreadyExists) return;
      const target = state.todos.find((t) => t.id === tempId);
      if (target) {
        target.id = serverId;
      }
    },
    toggleTodoStatus(state, action: PayloadAction<number>) {
      state.hasMutatedTodos = true;
      const target = state.todos.find((t) => t.id === action.payload);
      if (target) {
        target.completed = !target.completed;
        target.status = target.completed ? 'done' : 'to-do';
      }
      state.uncompletedCount = countUncompleted(state.todos);
    },
    markTodoStatus(
      state,
      action: PayloadAction<{ id: number; completed: boolean }>
    ) {
      state.hasMutatedTodos = true;
      const target = state.todos.find((t) => t.id === action.payload.id);
      if (target) {
        target.completed = action.payload.completed;
        target.status = action.payload.completed ? 'done' : 'to-do';
      }
      state.uncompletedCount = countUncompleted(state.todos);
    },
    deleteTodoById(state, action: PayloadAction<number>) {
      state.hasMutatedTodos = true;
      state.todos = state.todos.filter((item) => item.id !== action.payload);
      state.uncompletedCount = countUncompleted(state.todos);
    },
    clearAllTodos(state) {
      state.hasMutatedTodos = true;
      state.todos = [];
      state.uncompletedCount = 0;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setIsSearchVisible(state, action: PayloadAction<boolean>) {
      state.isSearchVisible = action.payload;
    },
    toggleSearchVisible(state) {
      const next = !state.isSearchVisible;
      state.isSearchVisible = next;
      if (!next) {
        state.searchQuery = '';
      }
    },
    setActivePaletteId(state, action: PayloadAction<MaterialYouPaletteId>) {
      state.activePaletteId = action.payload;
    },
    setUseTodayDate(state, action: PayloadAction<boolean>) {
      state.useTodayDate = action.payload;
    },
    toggleUseTodayDate(state) {
      state.useTodayDate = !state.useTodayDate;
    },
    setIsAddModalOpen(state, action: PayloadAction<boolean>) {
      state.isAddModalOpen = action.payload;
    },
    setIsThemeModalOpen(state, action: PayloadAction<boolean>) {
      state.isThemeModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateFromStorage.fulfilled, (state, action) => {
        const { todos, palette, useTodayDate } = action.payload;
        if (todos !== null && !state.hasMutatedTodos) {
          state.todos = todos;
          state.uncompletedCount = countUncompleted(todos);
        }
        if (palette !== null) {
          state.activePaletteId = palette;
        }
        if (useTodayDate !== null) {
          state.useTodayDate = useTodayDate;
        }
        state.isStorageHydrated = true;
      })
      .addCase(hydrateFromStorage.rejected, (state) => {
        state.isStorageHydrated = true;
      })
      .addCase(loadTodosFromApi.pending, (state, action) => {
        if (action.meta.arg) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(loadTodosFromApi.fulfilled, (state, action) => {
        state.hasMutatedTodos = true;
        state.todos = action.payload;
        state.uncompletedCount = countUncompleted(action.payload);
        state.loading = false;
        state.refreshing = false;
      })
      .addCase(loadTodosFromApi.rejected, (state) => {
        state.loading = false;
        state.refreshing = false;
      });
  },
});

export const {
  setTodos,
  addTodo,
  reconcileTodoId,
  toggleTodoStatus,
  markTodoStatus,
  deleteTodoById,
  clearAllTodos,
  setSearchQuery,
  setIsSearchVisible,
  toggleSearchVisible,
  setActivePaletteId,
  setUseTodayDate,
  toggleUseTodayDate,
  setIsAddModalOpen,
  setIsThemeModalOpen,
} = todoSlice.actions;

export default todoSlice.reducer;

// Selectors
export const selectTodos = (state: { todos: TodoState }) => state.todos.todos;
export const selectUncompletedCount = (state: { todos: TodoState }) =>
  state.todos.uncompletedCount;
export const selectTotalCount = (state: { todos: TodoState }) =>
  state.todos.todos.length;
export const selectCompletedCount = (state: { todos: TodoState }) =>
  state.todos.todos.length - state.todos.uncompletedCount;
export const selectProgressPercent = (state: { todos: TodoState }) => {
  const total = state.todos.todos.length;
  const completed = total - state.todos.uncompletedCount;
  return total > 0 ? completed / total : 0;
};
export const selectIsStorageHydrated = (state: { todos: TodoState }) =>
  state.todos.isStorageHydrated;
export const selectLoading = (state: { todos: TodoState }) =>
  state.todos.loading;
export const selectRefreshing = (state: { todos: TodoState }) =>
  state.todos.refreshing;
export const selectSearchQuery = (state: { todos: TodoState }) =>
  state.todos.searchQuery;
export const selectIsSearchVisible = (state: { todos: TodoState }) =>
  state.todos.isSearchVisible;
export const selectActivePaletteId = (state: { todos: TodoState }) =>
  state.todos.activePaletteId;
export const selectCurrentTheme = (state: { todos: TodoState }) =>
  MATERIAL_YOU_PALETTES[state.todos.activePaletteId];
export const selectUseTodayDate = (state: { todos: TodoState }) =>
  state.todos.useTodayDate;
export const selectIsAddModalOpen = (state: { todos: TodoState }) =>
  state.todos.isAddModalOpen;
export const selectIsThemeModalOpen = (state: { todos: TodoState }) =>
  state.todos.isThemeModalOpen;
