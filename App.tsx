import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Todo, TabType } from './src/types/todo';
import { COLORS } from './src/constants/theme';
import {
  fetchTodos,
  addTodoApi,
  toggleTodoApi,
  deleteTodoApi,
} from './src/services/todoApi';
import { Header } from './src/components/Header';
import { TodoItem } from './src/components/TodoItem';
import { BottomNavBar } from './src/components/BottomNavBar';
import { AddTodoModal } from './src/components/AddTodoModal';
import { SearchBar } from './src/components/SearchBar';
import { ProfileModal } from './src/components/ProfileModal';

function getFormattedToday(): string {
  const d = new Date();
  const day = d.getDate();
  const suffix = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${day}${suffix(day)} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function MainScreen() {
  const insets = useSafeAreaInsets();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Toggle between mock date ("4th March 2018") and today's date
  const [useTodayDate, setUseTodayDate] = useState(false);
  const currentDateText = useTodayDate ? getFormattedToday() : '4th March 2018';

  const loadTodosData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchTodos(30, 0);
      setTodos(data.todos);
    } catch (err: any) {
      setError('Не вдалося завантажити завдання. Перевірте зʼєднання.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTodosData();
  }, [loadTodosData]);

  const handleToggle = useCallback(async (id: number) => {
    setTodos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );

    const target = todos.find((t) => t.id === id);
    if (target) {
      await toggleTodoApi(id, !target.completed);
    }
  }, [todos]);

  const handleDelete = useCallback(async (id: number) => {
    setTodos((prev) => prev.filter((item) => item.id !== id));
    await deleteTodoApi(id);
  }, []);

  const handleAddTodo = useCallback(async (text: string, time: string) => {
    // Optimistic item
    const tempId = Date.now();
    const newTodo: Todo = {
      id: tempId,
      todo: text,
      completed: false,
      userId: 1,
      time: time,
    };
    setTodos((prev) => [newTodo, ...prev]);

    // Send API request
    try {
      const serverTodo = await addTodoApi(text, time);
      setTodos((prev) =>
        prev.map((t) => (t.id === tempId ? { ...t, id: serverTodo.id } : t))
      );
    } catch (e) {
      console.warn('Using local fallback for added todo:', e);
    }
  }, []);

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'profile') {
      setIsProfileModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  // Filtered list based on active tab and search query
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      // Tab filter
      if (activeTab === 'pending' && item.completed) return false;
      if (activeTab === 'completed' && !item.completed) return false;

      // Search filter
      if (searchQuery.trim().length > 0) {
        return item.todo.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [todos, activeTab, searchQuery]);

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header section matching mockup */}
      <Header
        totalTasks={totalCount}
        completedTasks={completedCount}
        currentDateText={currentDateText}
        onToggleDate={() => setUseTodayDate((prev) => !prev)}
        onOpenSearch={() => {
          setIsSearchActive((prev) => !prev);
          if (isSearchActive) setSearchQuery('');
        }}
        isSearchActive={isSearchActive}
      />

      {/* Search Input when search is toggled */}
      {isSearchActive && (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      )}

      {/* Active Tab Filter Indicator */}
      {activeTab !== 'all' && (
        <View style={styles.activeFilterBar}>
          <Text style={styles.activeFilterText}>
            Фільтр: {activeTab === 'pending' ? 'В процесі' : 'Виконані'}
          </Text>
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={styles.clearFilterBtn}
          >
            <Text style={styles.clearFilterText}>Показати всі</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main List Area */}
      <View style={styles.listContainer}>
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Завантаження списку завдань...</Text>
          </View>
        ) : error && todos.length === 0 ? (
          <View style={styles.centered}>
            <Feather name="alert-circle" size={40} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadTodosData()}
            >
              <Text style={styles.retryButtonText}>Повторити спробу</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredTodos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TodoItem
                todo={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadTodosData(true)}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="inbox" size={48} color={COLORS.iconInactive} />
                <Text style={styles.emptyTitle}>Завдань не знайдено</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'Спробуйте інший пошуковий запит'
                    : 'Натисніть "+", щоб додати перше завдання'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Bottom Navigation with Floating Action Button */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        bottomInset={insets.bottom}
      />

      {/* Add Task Modal */}
      <AddTodoModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTodo}
      />

      {/* Profile & Stats Modal */}
      <ProfileModal
        visible={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        total={totalCount}
        completed={completedCount}
        onResetData={() => loadTodosData()}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.listBg,
  },
  flatListContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.danger,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  activeFilterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: COLORS.primaryLight,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  clearFilterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSubtitle,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
});
