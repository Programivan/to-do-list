import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Todo, TabType, TodoFormData } from './src/types/todo';
import {
  MaterialYouPaletteId,
  MATERIAL_YOU_PALETTES,
  GLASS_TOKENS,
  COLORS,
} from './src/constants/theme';
import {
  fetchTodos,
  addTodoApi,
  toggleTodoApi,
  deleteTodoApi,
} from './src/services/todoApi';
import { TodoItem } from './src/components/TodoItem';
import { AddTodoModal } from './src/components/AddTodoModal';
import { LiquidBackground } from './src/components/LiquidBackground';
import { ThemeSelectorModal } from './src/components/ThemeSelectorModal';
import { triggerHaptic, triggerNotificationHaptic } from './src/utils/haptics';

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

  // Material You Dynamic Theme State
  const [activePaletteId, setActivePaletteId] = useState<MaterialYouPaletteId>('ocean');
  const currentTheme = MATERIAL_YOU_PALETTES[activePaletteId];
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Date toggle (mock date vs today)
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

  // Clear entire list
  const handleClearAll = useCallback(() => {
    if (todos.length === 0) return;
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Очистити список',
      'Видалити всі завдання зі списку?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити всі',
          style: 'destructive',
          onPress: () => {
            triggerNotificationHaptic(Haptics.NotificationFeedbackType.Warning);
            setTodos([]);
          },
        },
      ]
    );
  }, [todos.length]);

  const handleToggle = useCallback(async (id: number) => {
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
    const target = todos.find((t) => t.id === id);
    if (target) {
      await toggleTodoApi(id, !target.completed);
    }
  }, [todos]);

  const handleDelete = useCallback(async (id: number) => {
    setTodos((prev) => prev.filter((item) => item.id !== id));
    await deleteTodoApi(id);
  }, []);

  // React Hook Form submission handler
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
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
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
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Dynamic Ambient Liquid Mesh Background ("Рідке Скло") */}
      <LiquidBackground theme={currentTheme} />

      <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Floating Liquid Glass Top App Bar */}
        <View style={styles.glassTopBarContainer}>
          <BlurView intensity={GLASS_TOKENS.blurIntensityHeader} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={GLASS_TOKENS.sheenGradientSubtle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barSheen}
          />

          <View style={styles.topAppBar}>
            <View style={styles.titleArea}>
              <View style={styles.appTitleRow}>
                <Text style={styles.appTitle}>ODOT List</Text>
                <View style={[styles.glassBadge, { borderColor: `${currentTheme.primary}50` }]}>
                  <Text style={[styles.glassBadgeText, { color: currentTheme.primary }]}>Glass M3</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.dateBadge}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  setUseTodayDate((prev) => !prev);
                }}
                activeOpacity={0.7}
              >
                <Feather name="calendar" size={12} color={currentTheme.primary} style={{ marginRight: 6 }} />
                <Text style={styles.dateText}>{currentDateText}</Text>
                <Feather name="repeat" size={10} color="#7E8497" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>

            {/* Top Action Buttons with Glass Styling */}
            <View style={styles.actionsRow}>
              {/* Material You Theme Swatch Button */}
              <TouchableOpacity
                style={[styles.glassIconBtn, { borderColor: `${currentTheme.primary}60` }]}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  setIsThemeModalOpen(true);
                }}
                activeOpacity={0.75}
              >
                <LinearGradient
                  colors={currentTheme.accentGradient}
                  style={styles.themeSwatchSmall}
                >
                  <Feather name="droplet" size={12} color={currentTheme.onPrimary} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Search Toggle Button */}
              <TouchableOpacity
                style={[styles.glassIconBtn, isSearchVisible && [styles.iconBtnActive, { borderColor: currentTheme.primary }]]}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  setIsSearchVisible((v) => !v);
                  if (isSearchVisible) setSearchQuery('');
                }}
                activeOpacity={0.7}
              >
                <Feather
                  name={isSearchVisible ? 'x' : 'search'}
                  size={16}
                  color={isSearchVisible ? currentTheme.primary : '#C6CBDA'}
                />
              </TouchableOpacity>

              {/* DummyJSON Sync Button */}
              <TouchableOpacity
                style={styles.glassIconBtn}
                onPress={() => handleLoadFromApi(false)}
                activeOpacity={0.7}
              >
                <Feather name="download-cloud" size={16} color={currentTheme.primary} />
              </TouchableOpacity>

              {/* Clear All Button */}
              {todos.length > 0 && (
                <TouchableOpacity
                  style={[styles.glassIconBtn, styles.iconBtnDanger]}
                  onPress={handleClearAll}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={16} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Liquid Glass Progress Bar */}
        {totalCount > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.glassProgressCard}>
              <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.progressHeader}>
                <View style={styles.progressLabelGroup}>
                  <Feather name="activity" size={12} color={currentTheme.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.progressLabel}>Прогрес виконання</Text>
                </View>
                <Text style={[styles.progressCount, { color: currentTheme.primary }]}>
                  {completedCount} з {totalCount} ({Math.round(progressPercent * 100)}%)
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <Animated.View style={[styles.progressBarFill, { width: progressInterpolated }]}>
                  <LinearGradient
                    colors={currentTheme.accentGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
            </View>
          </View>
        )}

        {/* Liquid Glass Searchbar */}
        {isSearchVisible && (
          <View style={styles.searchSection}>
            <View style={styles.glassSearchContainer}>
              <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
              <Feather name="search" size={16} color={currentTheme.primary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Швидкий пошук завдань..."
                placeholderTextColor="#7E8497"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    setSearchQuery('');
                  }}
                  style={styles.clearBtn}
                >
                  <Feather name="x-circle" size={16} color="#7E8497" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Liquid Glass Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.glassChip,
              activeTab === 'all' && [
                styles.chipActive,
                { borderColor: currentTheme.primary, backgroundColor: `${currentTheme.primary}18` },
              ],
            ]}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('all');
            }}
            activeOpacity={0.75}
          >
            <Feather
              name="layers"
              size={13}
              color={activeTab === 'all' ? currentTheme.primary : '#7E8497'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.chipText, activeTab === 'all' && { color: currentTheme.primary, fontWeight: '800' }]}>
              Всі
            </Text>
            <View
              style={[
                styles.chipBadge,
                activeTab === 'all' && { backgroundColor: currentTheme.primary },
              ]}
            >
              <Text
                style={[
                  styles.chipBadgeText,
                  activeTab === 'all' && { color: currentTheme.onPrimary, fontWeight: '800' },
                ]}
              >
                {totalCount}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.glassChip,
              activeTab === 'pending' && [
                styles.chipActive,
                { borderColor: currentTheme.primary, backgroundColor: `${currentTheme.primary}18` },
              ],
            ]}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('pending');
            }}
            activeOpacity={0.75}
          >
            <Feather
              name="clock"
              size={13}
              color={activeTab === 'pending' ? currentTheme.primary : '#7E8497'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.chipText, activeTab === 'pending' && { color: currentTheme.primary, fontWeight: '800' }]}>
              to-do
            </Text>
            <View
              style={[
                styles.chipBadge,
                activeTab === 'pending' && { backgroundColor: currentTheme.primary },
              ]}
            >
              <Text
                style={[
                  styles.chipBadgeText,
                  activeTab === 'pending' && { color: currentTheme.onPrimary, fontWeight: '800' },
                ]}
              >
                {pendingCount}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.glassChip,
              activeTab === 'completed' && [
                styles.chipActive,
                { borderColor: COLORS.success, backgroundColor: 'rgba(105, 226, 168, 0.18)' },
              ],
            ]}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('completed');
            }}
            activeOpacity={0.75}
          >
            <Feather
              name="check-circle"
              size={13}
              color={activeTab === 'completed' ? COLORS.success : '#7E8497'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.chipText, activeTab === 'completed' && { color: COLORS.success, fontWeight: '800' }]}>
              done
            </Text>
            <View
              style={[
                styles.chipBadge,
                activeTab === 'completed' && { backgroundColor: COLORS.success },
              ]}
            >
              <Text
                style={[
                  styles.chipBadgeText,
                  activeTab === 'completed' && { color: '#003920', fontWeight: '800' },
                ]}
              >
                {completedCount}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main FlatList Area */}
        <View style={styles.listArea}>
          {loading ? (
            <View style={styles.centerContainer}>
              <View style={styles.loadingGlassCard}>
                <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Feather name="loader" size={36} color={currentTheme.primary} />
                </Animated.View>
                <Text style={styles.loadingTitle}>Завантаження з DummyJSON...</Text>
                <Text style={styles.loadingSubtitle}>Синхронізація завдань у скляному інтерфейсі</Text>
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
                  theme={currentTheme}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => handleLoadFromApi(true)}
                  tintColor={currentTheme.primary}
                  colors={[currentTheme.primary]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyGlassCard}>
                    <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
                    <LinearGradient
                      colors={GLASS_TOKENS.sheenGradientSubtle}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.barSheen}
                    />

                    <Animated.View
                      style={[
                        styles.emptyIconCircle,
                        { borderColor: `${currentTheme.primary}40`, backgroundColor: `${currentTheme.primary}15` },
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <Feather name="check" size={36} color={currentTheme.primary} />
                    </Animated.View>

                    <Text style={styles.emptyTitle}>Список завдань порожній</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery
                        ? 'За запитом нічого не знайдено'
                        : 'Створіть нове завдання через форму з React Hook Form або завантажте з DummyJSON'}
                    </Text>

                    <View style={styles.emptyBtnGroup}>
                      <TouchableOpacity
                        style={styles.emptyPrimaryBtn}
                        onPress={() => {
                          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                          setIsAddModalOpen(true);
                        }}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={currentTheme.accentGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.emptyPrimaryBtnGradient}
                        >
                          <Feather name="plus-circle" size={17} color={currentTheme.onPrimary} style={{ marginRight: 8 }} />
                          <Text style={[styles.emptyPrimaryBtnText, { color: currentTheme.onPrimary }]}>
                            Створити завдання (Форма)
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.emptySecondaryBtn}
                        onPress={() => handleLoadFromApi(false)}
                        activeOpacity={0.8}
                      >
                        <Feather name="download-cloud" size={17} color={currentTheme.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.emptySecondaryBtnText, { color: currentTheme.primary }]}>
                          Завантажити з DummyJSON
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              }
            />
          )}
        </View>

        {/* Liquid Glass FAB with Spring Bounce & Multi-Layer Glow */}
        <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
              setIsAddModalOpen(true);
            }}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            activeOpacity={1}
          >
            <LinearGradient
              colors={currentTheme.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Feather name="plus" size={30} color={currentTheme.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Modal 1: React Hook Form Task Creation Modal */}
        <AddTodoModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTodo}
          theme={currentTheme}
        />

        {/* Modal 2: Material You Dynamic Palette Selector */}
        <ThemeSelectorModal
          visible={isThemeModalOpen}
          activePaletteId={activePaletteId}
          onSelectPalette={setActivePaletteId}
          onClose={() => setIsThemeModalOpen(false)}
        />
      </View>
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
    backgroundColor: '#08090C',
  },
  mainContainer: {
    flex: 1,
  },
  glassTopBarContainer: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: GLASS_TOKENS.glassBorderHighlight,
    backgroundColor: GLASS_TOKENS.appBarGlassBg,
  },
  barSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleArea: {
    flex: 1,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F5F6FA',
    letterSpacing: -0.6,
  },
  glassBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  glassBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C6CBDA',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  glassIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  iconBtnDanger: {
    borderColor: 'rgba(255, 120, 120, 0.35)',
    backgroundColor: 'rgba(255, 50, 50, 0.08)',
  },
  themeSwatchSmall: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  glassProgressCard: {
    borderRadius: 18,
    overflow: 'hidden',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E8497',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  glassSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 46,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F6FA',
  },
  clearBtn: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  chipActive: {
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E8497',
  },
  chipBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E8497',
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 95,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingGlassCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(22, 26, 38, 0.65)',
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F5F6FA',
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#7E8497',
    marginTop: 4,
  },
  emptyContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  emptyGlassCard: {
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(22, 26, 38, 0.65)',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F5F6FA',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#7E8497',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 22,
  },
  emptyBtnGroup: {
    width: '100%',
    gap: 10,
  },
  emptyPrimaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyPrimaryBtnGradient: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptySecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  emptySecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
