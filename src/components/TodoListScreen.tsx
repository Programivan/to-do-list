import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { COLORS, GLASS_TOKENS } from '@/constants/theme';
import { LiquidBackground } from '@/components/LiquidBackground';
import { TodoItem } from '@/components/TodoItem';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteTodoAsync,
  loadTodosFromApi,
  selectCompletedCount,
  selectCurrentTheme,
  selectIsSearchVisible,
  selectIsStorageHydrated,
  selectLoading,
  selectProgressPercent,
  selectRefreshing,
  selectSearchQuery,
  selectTodos,
  selectTotalCount,
  selectUseTodayDate,
  setIsAddModalOpen,
  setIsThemeModalOpen,
  setSearchQuery,
  toggleSearchVisible,
  toggleTodoAsync,
  toggleUseTodayDate,
} from '@/store/todoSlice';
import { getFormattedDate } from '@/utils/date';
import { triggerHaptic } from '@/utils/haptics';
import { confirmClearAllTodos } from '@/utils/todoAlerts';

export type TodoListFilter = 'all' | 'pending' | 'completed';

interface TodoListScreenProps {
  filter: TodoListFilter;
}

const FILTER_META: Record<
  TodoListFilter,
  {
    headerTitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyIcon: React.ComponentProps<typeof Feather>['name'];
  }
> = {
  all: {
    headerTitle: 'ToDo List',
    emptyTitle: 'Список завдань порожній',
    emptySubtitle:
      'Створіть нове завдання через форму з React Hook Form або завантажте з DummyJSON',
    emptyIcon: 'check',
  },
  pending: {
    headerTitle: 'В роботі',
    emptyTitle: 'Немає активних завдань',
    emptySubtitle:
      'Усі заплановані завдання виконано або додайте нове завдання до списку',
    emptyIcon: 'clock',
  },
  completed: {
    headerTitle: 'Виконані',
    emptyTitle: 'Поки що немає виконаних',
    emptySubtitle:
      'Позначте завдання як виконані у вкладці «Всі» або «В роботі», і вони з’являться тут',
    emptyIcon: 'check-circle',
  },
};

/**
 * Shared glassmorphic task list screen rendered by the All, Pending, and Completed tabs.
 */
export const TodoListScreen: React.FC<TodoListScreenProps> = ({ filter }) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const dispatch = useAppDispatch();

  const currentTheme = useAppSelector(selectCurrentTheme);
  const todos = useAppSelector(selectTodos);
  const isStorageHydrated = useAppSelector(selectIsStorageHydrated);
  const loading = useAppSelector(selectLoading);
  const refreshing = useAppSelector(selectRefreshing);
  const searchQuery = useAppSelector(selectSearchQuery);
  const isSearchVisible = useAppSelector(selectIsSearchVisible);
  const useTodayDate = useAppSelector(selectUseTodayDate);
  const totalCount = useAppSelector(selectTotalCount);
  const completedCount = useAppSelector(selectCompletedCount);
  const progressPercent = useAppSelector(selectProgressPercent);

  const currentDateText = useTodayDate ? getFormattedDate() : '4th March 2018';

  const handleToggle = useCallback(
    (id: number) => {
      void dispatch(toggleTodoAsync(id));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id: number) => {
      void dispatch(deleteTodoAsync(id));
    },
    [dispatch]
  );

  const handleLoadFromApi = useCallback(
    (isRefresh = false) => {
      void dispatch(loadTodosFromApi(isRefresh));
    },
    [dispatch]
  );

  const handleClearAll = useCallback(() => {
    confirmClearAllTodos(dispatch, totalCount);
  }, [dispatch, totalCount]);

  const openAddModal = useCallback(() => {
    dispatch(setIsAddModalOpen(true));
  }, [dispatch]);

  const openThemeModal = useCallback(() => {
    dispatch(setIsThemeModalOpen(true));
  }, [dispatch]);

  const meta = FILTER_META[filter];

  const [fabScale] = useState(() => new Animated.Value(1));
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  const filteredTodos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return todos.filter((item) => {
      if (filter === 'pending' && item.completed) return false;
      if (filter === 'completed' && !item.completed) return false;
      if (query.length > 0) {
        return item.todo.toLowerCase().includes(query);
      }
      return true;
    });
  }, [todos, filter, searchQuery]);

  useEffect(() => {
    if (filteredTodos.length === 0) {
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
  }, [filteredTodos.length, pulseAnim]);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercent,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [progressPercent, progressAnim]);

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
      <LiquidBackground theme={currentTheme} />

      <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
        {/* Top App Bar */}
        <View style={styles.glassTopBarContainer}>
          <BlurView
            intensity={GLASS_TOKENS.blurIntensityHeader}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={GLASS_TOKENS.sheenGradientSubtle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barSheen}
          />

          <View style={styles.topAppBar}>
            <View style={styles.titleArea}>
              <View style={styles.appTitleRow}>
                <Text style={styles.appTitle}>{meta.headerTitle}</Text>
                {filter !== 'all' && (
                  <View
                    style={[
                      styles.glassBadge,
                      { borderColor: `${currentTheme.primary}60` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.glassBadgeText,
                        { color: currentTheme.primary },
                      ]}
                    >
                      {filteredTodos.length}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.dateBadge}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  dispatch(toggleUseTodayDate());
                }}
                activeOpacity={0.7}
              >
                <Feather
                  name="calendar"
                  size={12}
                  color={currentTheme.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.dateText}>{currentDateText}</Text>
                <Feather
                  name="repeat"
                  size={10}
                  color="#7E8497"
                  style={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
            </View>

            {/* Top Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.glassIconBtn,
                  { borderColor: `${currentTheme.primary}60` },
                ]}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  openThemeModal();
                }}
                activeOpacity={0.75}
              >
                <LinearGradient
                  colors={currentTheme.accentGradient}
                  style={styles.themeSwatchSmall}
                >
                  <Feather
                    name="droplet"
                    size={12}
                    color={currentTheme.onPrimary}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.glassIconBtn,
                  isSearchVisible && [
                    styles.iconBtnActive,
                    { borderColor: currentTheme.primary },
                  ],
                ]}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  dispatch(toggleSearchVisible());
                }}
                activeOpacity={0.7}
              >
                <Feather
                  name={isSearchVisible ? 'x' : 'search'}
                  size={16}
                  color={isSearchVisible ? currentTheme.primary : '#C6CBDA'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.glassIconBtn}
                onPress={() => handleLoadFromApi(false)}
                activeOpacity={0.7}
              >
                <Feather
                  name="download-cloud"
                  size={16}
                  color={currentTheme.primary}
                />
              </TouchableOpacity>

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

        {/* Progress Bar */}
        {totalCount > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.glassProgressCard}>
              <BlurView
                intensity={35}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.progressHeader}>
                <View style={styles.progressLabelGroup}>
                  <Feather
                    name="activity"
                    size={12}
                    color={currentTheme.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.progressLabel}>Прогрес виконання</Text>
                </View>
                <Text
                  style={[
                    styles.progressCount,
                    { color: currentTheme.primary },
                  ]}
                >
                  {completedCount} з {totalCount} (
                  {Math.round(progressPercent * 100)}%)
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { width: progressInterpolated },
                  ]}
                >
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

        {/* Searchbar */}
        {isSearchVisible && (
          <View style={styles.searchSection}>
            <View style={styles.glassSearchContainer}>
              <BlurView
                intensity={45}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <Feather
                name="search"
                size={16}
                color={currentTheme.primary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Швидкий пошук завдань..."
                placeholderTextColor="#7E8497"
                value={searchQuery}
                onChangeText={(q) => dispatch(setSearchQuery(q))}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    dispatch(setSearchQuery(''));
                  }}
                  style={styles.clearBtn}
                >
                  <Feather name="x-circle" size={16} color="#7E8497" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Main FlatList Area */}
        <View style={styles.listArea}>
          {loading ? (
            <View style={styles.centerContainer}>
              <View style={styles.loadingGlassCard}>
                <BlurView
                  intensity={50}
                  tint="dark"
                  style={StyleSheet.absoluteFill}
                />
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Feather
                    name="loader"
                    size={36}
                    color={currentTheme.primary}
                  />
                </Animated.View>
                <Text style={styles.loadingTitle}>
                  Завантаження з DummyJSON...
                </Text>
                <Text style={styles.loadingSubtitle}>
                  Синхронізація завдань у скляному інтерфейсі
                </Text>
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
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: tabBarHeight + 92 },
              ]}
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
                isStorageHydrated ? (
                  <View style={styles.emptyContainer}>
                  <View style={styles.emptyGlassCard}>
                    <BlurView
                      intensity={55}
                      tint="dark"
                      style={StyleSheet.absoluteFill}
                    />
                    <LinearGradient
                      colors={GLASS_TOKENS.sheenGradientSubtle}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.barSheen}
                    />

                    <Animated.View
                      style={[
                        styles.emptyIconCircle,
                        {
                          borderColor: `${currentTheme.primary}40`,
                          backgroundColor: `${currentTheme.primary}15`,
                        },
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <Feather
                        name={meta.emptyIcon}
                        size={36}
                        color={currentTheme.primary}
                      />
                    </Animated.View>

                    <Text style={styles.emptyTitle}>{meta.emptyTitle}</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery
                        ? 'За запитом нічого не знайдено'
                        : meta.emptySubtitle}
                    </Text>

                    <View style={styles.emptyBtnGroup}>
                      <TouchableOpacity
                        style={styles.emptyPrimaryBtn}
                        onPress={() => {
                          triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                          openAddModal();
                        }}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={currentTheme.accentGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.emptyPrimaryBtnGradient}
                        >
                          <Feather
                            name="plus-circle"
                            size={17}
                            color={currentTheme.onPrimary}
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={[
                              styles.emptyPrimaryBtnText,
                              { color: currentTheme.onPrimary },
                            ]}
                          >
                            Створити завдання (Форма)
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.emptySecondaryBtn}
                        onPress={() => handleLoadFromApi(false)}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name="download-cloud"
                          size={17}
                          color={currentTheme.primary}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={[
                            styles.emptySecondaryBtnText,
                            { color: currentTheme.primary },
                          ]}
                        >
                          Завантажити з DummyJSON
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                ) : undefined
              }
            />
          )}
        </View>

        {/* FAB positioned cleanly above the bottom tab bar */}
        <Animated.View
          style={[
            styles.fabContainer,
            {
              bottom: tabBarHeight + 16,
              transform: [{ scale: fabScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
              openAddModal();
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
      </View>
    </View>
  );
};

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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  glassBadgeText: {
    fontSize: 12,
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
    paddingBottom: 4,
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
  listArea: {
    flex: 1,
  },
  listContent: {
    paddingTop: 6,
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
