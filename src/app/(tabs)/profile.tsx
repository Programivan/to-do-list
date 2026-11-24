import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  COLORS,
  GLASS_TOKENS,
  MATERIAL_YOU_PALETTES,
  MaterialYouPaletteId,
} from '@/constants/theme';
import { useTodoContext } from '@/context/TodoContext';
import { LiquidBackground } from '@/components/LiquidBackground';
import { triggerHaptic, triggerSelectionHaptic } from '@/utils/haptics';

/**
 * Profile, task statistics, and Material You theme settings tab.
 */
export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    activePaletteId,
    setActivePaletteId,
    currentTheme,
    totalCount,
    completedCount,
    pendingCount,
    progressPercent,
    loading,
    openThemeModal,
    handleLoadFromApi,
    handleClearAll,
  } = useTodoContext();

  const percent = Math.round(progressPercent * 100);

  return (
    <View style={styles.screen}>
      <LiquidBackground theme={currentTheme} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: tabBarHeight + 28,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card */}
        <View style={styles.glassCard}>
          <BlurView
            intensity={GLASS_TOKENS.blurIntensityCard}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={GLASS_TOKENS.sheenGradientSubtle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sheen}
          />

          <LinearGradient
            colors={currentTheme.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Feather name="user" size={30} color={currentTheme.onPrimary} />
          </LinearGradient>

          <Text style={styles.title}>Профіль ToDo</Text>
          <Text style={styles.subtitle}>
            Статистика виконання та налаштування
          </Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalCount}</Text>
              <Text style={styles.statLabel}>Всього</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {completedCount}
              </Text>
              <Text style={styles.statLabel}>Виконано</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: currentTheme.primary }]}>
                {pendingCount}
              </Text>
              <Text style={styles.statLabel}>В роботі</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Загальний прогрес</Text>
              <Text
                style={[styles.progressPercent, { color: currentTheme.primary }]}
              >
                {percent}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]}>
                <LinearGradient
                  colors={currentTheme.accentGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Material You Theme Picker Card */}
        <View style={styles.glassCard}>
          <BlurView
            intensity={GLASS_TOKENS.blurIntensityCard}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={GLASS_TOKENS.sheenGradientSubtle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sheen}
          />

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleGroup}>
              <Feather
                name="droplet"
                size={16}
                color={currentTheme.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitle}>Колірна палітра</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                openThemeModal();
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.sectionAction, { color: currentTheme.primary }]}
              >
                Детальніше
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.swatchRow}>
            {(Object.keys(MATERIAL_YOU_PALETTES) as MaterialYouPaletteId[]).map(
              (id) => {
                const palette = MATERIAL_YOU_PALETTES[id];
                const isSelected = id === activePaletteId;
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => {
                      triggerSelectionHaptic();
                      setActivePaletteId(id);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.swatchButton,
                      isSelected && {
                        borderColor: palette.primary,
                        backgroundColor: 'rgba(255, 255, 255, 0.10)',
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={palette.accentGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.swatchCircle}
                    >
                      {isSelected && (
                        <Feather
                          name="check"
                          size={14}
                          color={palette.onPrimary}
                        />
                      )}
                    </LinearGradient>
                    <Text
                      style={[
                        styles.swatchLabel,
                        isSelected && { color: '#F5F6FA', fontWeight: '800' },
                      ]}
                      numberOfLines={1}
                    >
                      {palette.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </View>

        {/* Actions Card */}
        <View style={styles.glassCard}>
          <BlurView
            intensity={GLASS_TOKENS.blurIntensityCard}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={GLASS_TOKENS.sheenGradientSubtle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sheen}
          />

          <View style={styles.infoBox}>
            <Feather
              name="cloud"
              size={16}
              color={currentTheme.primary}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.infoText}>
              Синхронізація завдань із DummyJSON REST API
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => handleLoadFromApi(false)}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={currentTheme.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryActionGradient}
            >
              <Feather
                name="refresh-cw"
                size={16}
                color={currentTheme.onPrimary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.primaryActionText,
                  { color: currentTheme.onPrimary },
                ]}
              >
                {loading ? 'Завантаження...' : 'Завантажити з DummyJSON'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {totalCount > 0 && (
            <TouchableOpacity
              style={styles.dangerActionBtn}
              onPress={handleClearAll}
              activeOpacity={0.8}
            >
              <Feather
                name="trash-2"
                size={16}
                color={COLORS.danger}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dangerActionText}>
                Очистити всі завдання
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },
  glassCard: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: GLASS_TOKENS.glassBorderHighlight,
    backgroundColor: GLASS_TOKENS.cardGlassBg,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F5F6FA',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: '#7E8497',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F5F6FA',
  },
  statLabel: {
    fontSize: 12,
    color: '#7E8497',
    marginTop: 3,
    fontWeight: '600',
  },
  progressSection: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C6CBDA',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F5F6FA',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '700',
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  swatchButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  swatchCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  swatchLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7E8497',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#C6CBDA',
    fontWeight: '600',
  },
  primaryActionBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  dangerActionBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 50, 50, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 120, 120, 0.35)',
  },
  dangerActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
