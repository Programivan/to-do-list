import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PaperProvider,
  Appbar,
  Searchbar,
  Chip,
  FAB,
  Button,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';

import { Todo, TabType } from './src/types/todo';
import { M3DarkTheme, COLORS } from './src/constants/theme';
import {
  fetchTodos,
  addTodoApi,
  toggleTodoApi,
  deleteTodoApi,
} from './src/services/todoApi';
import { TodoItem } from './src/components/TodoItem';
import { AddTodoModal } from './src/components/AddTodoModal';

function getFormattedDate(): string {
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
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${day}${suffix(day)} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function MainScreen() {
  const insets = useSafeAreaInsets();

  // Initial list is empty as requested ("удали весь список")
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load from DummyJSON API
  const handleLoadFromApi = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchTodos(30, 0);
      setTodos(data.todos);
    } catch (err) {
      Alert.alert('Помилка', 'Не вдалося завантажити завдання із сервера');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Clear entire list
  const handleClearAll = useCallback(() => {
    if (todos.length === 0) return;
    Alert.alert(
      'Очистити список',
      'Ви впевнені, що хочете видалити всі завдання?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Очистити', style: 'destructive', onPress: () => setTodos([]) },
      ]
    );
  }, [todos.length]);

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
    const tempId = Date.now();
    const newTodo: Todo = {
      id: tempId,
      todo: text,
      completed: false,
      userId: 1,
      time: time,
    };
    setTodos((prev) => [newTodo, ...prev]);

    try {
      const serverTodo = await addTodoApi(text, time);
      setTodos((prev) =>
        prev.map((t) => (t.id === tempId ? { ...t, id: serverTodo.id } : t))
      );
    } catch (e) {
      console.warn('Local fallback used for added todo:', e);
    }
  }, []);

  // Filtered todos
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      if (activeTab === 'pending' && item.completed) return false;
      if (activeTab === 'completed' && !item.completed) return false;

      if (searchQuery.trim().length > 0) {
        return item.todo.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [todos, activeTab, searchQuery]);

  const totalCount = todos.length;
  const pendingCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />

      {/* Material 3 Appbar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content
          title="ODOT List"
          titleStyle={styles.appBarTitle}
          subtitle={getFormattedDate()}
          subtitleStyle={styles.appBarSubtitle}
        />
        <Appbar.Action
          icon={isSearchVisible ? 'close' : 'magnify'}
          iconColor={COLORS.textLight}
          onPress={() => {
            setIsSearchVisible((v) => !v);
            if (isSearchVisible) setSearchQuery('');
          }}
        />
        <Appbar.Action
          icon="cloud-download-outline"
          iconColor={COLORS.primary}
          onPress={() => handleLoadFromApi(false)}
        />
        {todos.length > 0 && (
          <Appbar.Action
            icon="delete-sweep-outline"
            iconColor={COLORS.danger}
            onPress={handleClearAll}
          />
        )}
      </Appbar.Header>

      {/* Searchbar */}
      {isSearchVisible && (
        <View style={styles.searchWrapper}>
          <Searchbar
            placeholder="Пошук завдань..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
            autoFocus
          />
        </View>
      )}

      {/* Material 3 Filter Chips */}
      <View style={styles.chipContainer}>
        <Chip
          selected={activeTab === 'all'}
          onPress={() => setActiveTab('all')}
          style={[styles.chip, activeTab === 'all' && styles.chipActive]}
          textStyle={[styles.chipText, activeTab === 'all' && styles.chipTextActive]}
        >
          Всі ({totalCount})
        </Chip>
        <Chip
          selected={activeTab === 'pending'}
          onPress={() => setActiveTab('pending')}
          style={[styles.chip, activeTab === 'pending' && styles.chipActive]}
          textStyle={[styles.chipText, activeTab === 'pending' && styles.chipTextActive]}
        >
          В процесі ({pendingCount})
        </Chip>
        <Chip
          selected={activeTab === 'completed'}
          onPress={() => setActiveTab('completed')}
          style={[styles.chip, activeTab === 'completed' && styles.chipActive]}
          textStyle={[styles.chipText, activeTab === 'completed' && styles.chipTextActive]}
        >
          Виконані ({completedCount})
        </Chip>
      </View>

      {/* List Container */}
      <View style={styles.listArea}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Завантаження з DummyJSON...</Text>
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
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => handleLoadFromApi(true)}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <IconButton
                  icon="checkbox-marked-circle-outline"
                  size={52}
                  iconColor={COLORS.primary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>Список завдань порожній</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'Нічого не знайдено за вашим запитом'
                    : 'Створіть власне завдання або завантажте з DummyJSON API'}
                </Text>

                <View style={styles.emptyActions}>
                  <Button
                    mode="contained"
                    icon="plus"
                    buttonColor={COLORS.primary}
                    textColor="#002D6C"
                    onPress={() => setIsAddModalOpen(true)}
                    style={styles.emptyBtn}
                  >
                    Додати завдання
                  </Button>

                  <Button
                    mode="outlined"
                    icon="cloud-download"
                    textColor={COLORS.primary}
                    onPress={() => handleLoadFromApi(false)}
                    style={styles.emptyBtnOutline}
                  >
                    Завантажити з API
                  </Button>
                </View>
              </View>
            }
          />
        )}
      </View>

      {/* Material 3 Rounded Square FAB */}
      <FAB
        icon="plus"
        color="#002D6C"
        style={styles.fab}
        onPress={() => setIsAddModalOpen(true)}
        mode="elevated"
      />

      {/* Add Task Modal */}
      <AddTodoModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTodo}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={M3DarkTheme}>
        <MainScreen />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  appBar: {
    backgroundColor: COLORS.black,
    elevation: 0,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  appBarSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 46,
  },
  searchInput: {
    fontSize: 14,
    color: COLORS.textLight,
    alignSelf: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.onPrimaryContainer,
    fontWeight: '700',
  },
  listArea: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 90,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyCard: {
    marginHorizontal: 20,
    marginTop: 40,
    backgroundColor: COLORS.cardDark,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    margin: 0,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActions: {
    width: '100%',
    gap: 12,
  },
  emptyBtn: {
    borderRadius: 14,
  },
  emptyBtnOutline: {
    borderRadius: 14,
    borderColor: COLORS.border,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },
});
