import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Platform,
  UIManager,
  TextInput,
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
import { TodoItem } from './src/components/TodoItem';
import { AddTodoModal } from './src/components/AddTodoModal';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Date toggle (mock date 4th March 2018 vs today)
  const [useTodayDate, setUseTodayDate] = useState(false);
  const currentDateText = useTodayDate ? getFormattedDate() : '4th March 2018';

  // Animation states
  const [fabScale] = useState(() => new Animated.Value(1));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // Pulsing animation for empty state
  useEffect(() => {
    if (todos.length === 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [todos.length, pulseAnim]);

  // Animate progress bar when todos change
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? completedCount / totalCount : 0;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercent,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [progressPercent, progressAnim]);

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
      'Видалити всі завдання зі списку?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Видалити всі', style: 'destructive', onPress: () => setTodos([]) },
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

  // FAB bounce animation
  const handleFabPressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.9,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  const progressInterpolated = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />

      {/* Material 3 Expressive Top App Bar */}
      <View style={styles.topAppBar}>
        <View style={styles.titleArea}>
          <Text style={styles.appTitle}>ODOT List</Text>
          <TouchableOpacity
            style={styles.dateBadge}
            onPress={() => setUseTodayDate((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={13} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.dateText}>{currentDateText}</Text>
            <Feather name="repeat" size={10} color={COLORS.textMuted} style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>

        {/* Top Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.iconBtn, isSearchVisible && styles.iconBtnActive]}
            onPress={() => {
              setIsSearchVisible((v) => !v);
              if (isSearchVisible) setSearchQuery('');
            }}
            activeOpacity={0.7}
          >
            <Feather
              name={isSearchVisible ? 'x' : 'search'}
              size={18}
              color={isSearchVisible ? COLORS.primary : COLORS.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleLoadFromApi(false)}
            activeOpacity={0.7}
          >
            <Feather name="download-cloud" size={18} color={COLORS.primary} />
          </TouchableOpacity>

          {todos.length > 0 && (
            <TouchableOpacity
              style={[styles.iconBtn, styles.iconBtnDanger]}
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress pill if there are tasks */}
      {totalCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Прогрес виконання</Text>
            <Text style={styles.progressCount}>
              {completedCount} з {totalCount} ({Math.round(progressPercent * 100)}%)
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, { width: progressInterpolated }]} />
          </View>
        </View>
      )}

      {/* Expressive Searchbar */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={COLORS.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Швидкий пошук завдань..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Feather name="x-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Material 3 Expressive Filter Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.chip, activeTab === 'all' && styles.chipActive]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.75}
        >
          <Feather
            name="layers"
            size={14}
            color={activeTab === 'all' ? COLORS.primary : COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.chipText, activeTab === 'all' && styles.chipTextActive]}>
            Всі
          </Text>
          <View style={[styles.chipBadge, activeTab === 'all' && styles.chipBadgeActive]}>
            <Text style={[styles.chipBadgeText, activeTab === 'all' && styles.chipBadgeTextActive]}>
              {totalCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, activeTab === 'pending' && styles.chipActive]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.75}
        >
          <Feather
            name="clock"
            size={14}
            color={activeTab === 'pending' ? COLORS.primary : COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.chipText, activeTab === 'pending' && styles.chipTextActive]}>
            В процесі
          </Text>
          <View style={[styles.chipBadge, activeTab === 'pending' && styles.chipBadgeActive]}>
            <Text style={[styles.chipBadgeText, activeTab === 'pending' && styles.chipBadgeTextActive]}>
              {pendingCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, activeTab === 'completed' && styles.chipActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.75}
        >
          <Feather
            name="check-circle"
            size={14}
            color={activeTab === 'completed' ? COLORS.success : COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.chipText, activeTab === 'completed' && styles.chipTextActive]}>
            Виконані
          </Text>
          <View style={[styles.chipBadge, activeTab === 'completed' && styles.chipBadgeActive]}>
            <Text style={[styles.chipBadgeText, activeTab === 'completed' && styles.chipBadgeTextActive]}>
              {completedCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main FlatList Area */}
      <View style={styles.listArea}>
        {loading ? (
          <View style={styles.centerContainer}>
            <View style={styles.loadingCard}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Feather name="loader" size={36} color={COLORS.primary} />
              </Animated.View>
              <Text style={styles.loadingTitle}>Завантаження з DummyJSON...</Text>
              <Text style={styles.loadingSubtitle}>Синхронізація списку завдань</Text>
            </View>
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
              <View style={styles.emptyContainer}>
                <Animated.View
                  style={[
                    styles.emptyIconCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Feather name="check" size={38} color={COLORS.primary} />
                </Animated.View>

                <Text style={styles.emptyTitle}>Список завдань порожній</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'За запитом нічого не знайдено'
                    : 'Створіть нове завдання або завантажте готові з DummyJSON API'}
                </Text>

                <View style={styles.emptyBtnGroup}>
                  <TouchableOpacity
                    style={styles.emptyPrimaryBtn}
                    onPress={() => setIsAddModalOpen(true)}
                    activeOpacity={0.8}
                  >
                    <Feather name="plus-circle" size={18} color="#002966" style={{ marginRight: 8 }} />
                    <Text style={styles.emptyPrimaryBtnText}>Створити завдання</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.emptySecondaryBtn}
                    onPress={() => handleLoadFromApi(false)}
                    activeOpacity={0.8}
                  >
                    <Feather name="download-cloud" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.emptySecondaryBtnText}>Завантажити з DummyJSON</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        )}
      </View>

      {/* Material 3 Expressive Squircle FAB with Spring Bounce */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsAddModalOpen(true)}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          activeOpacity={1}
        >
          <Feather name="plus" size={30} color="#002966" />
        </TouchableOpacity>
      </Animated.View>

      {/* Material 3 Expressive Add Modal */}
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
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.black,
  },
  titleArea: {
    flex: 1,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textLight,
    letterSpacing: -0.6,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSubtitle,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: COLORS.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  iconBtnActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primary,
  },
  iconBtnDanger: {
    borderColor: '#4A1D20',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cardDark,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  clearBtn: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: COLORS.onPrimaryContainer,
  },
  chipBadge: {
    backgroundColor: COLORS.cardDarkElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  chipBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  chipBadgeTextActive: {
    color: '#002966',
  },
  listArea: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 95,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textLight,
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: COLORS.cardDark,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.cardDarkElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textLight,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
  },
  emptyBtnGroup: {
    width: '100%',
    gap: 10,
  },
  emptyPrimaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002966',
  },
  emptySecondaryBtn: {
    backgroundColor: COLORS.cardDarkElevated,
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  emptySecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
