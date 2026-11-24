import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Todo, Priority } from '../types/todo';
import { COLORS, GLASS_TOKENS, MaterialYouPalette } from '../constants/theme';
import { triggerHaptic } from '../utils/haptics';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  theme: MaterialYouPalette;
}

function getPriorityBadgeConfig(priority: Priority = 'medium') {
  switch (priority) {
    case 'high':
      return {
        label: 'High',
        bg: 'rgba(120, 24, 30, 0.45)',
        border: 'rgba(255, 120, 120, 0.45)',
        text: '#FFA4A2',
        icon: 'alert-circle' as const,
      };
    case 'medium':
      return {
        label: 'Med',
        bg: 'rgba(110, 65, 15, 0.45)',
        border: 'rgba(255, 195, 100, 0.45)',
        text: '#FFCF87',
        icon: 'clock' as const,
      };
    case 'low':
      return {
        label: 'Low',
        bg: 'rgba(20, 70, 110, 0.45)',
        border: 'rgba(130, 205, 255, 0.45)',
        text: '#82D0FF',
        icon: 'arrow-down' as const,
      };
  }
}

export const TodoItem: React.FC<TodoItemProps> = React.memo(({ todo, onToggle, onDelete, theme }) => {
  const [cardScale] = useState(() => new Animated.Value(1));
  const [checkScale] = useState(() => new Animated.Value(todo.completed ? 1 : 0.85));

  const priorityConfig = getPriorityBadgeConfig(todo.priority);

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
      tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 200,
    }).start();
  };

  const handleToggleWithAnimation = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle(todo.id);
  };

  const handleLongPress = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Видалити завдання?',
      `Видалити "${todo.todo}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
            onDelete(todo.id);
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: cardScale }] }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handleToggleWithAnimation}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        style={[
          styles.glassCard,
          todo.completed ? styles.glassCardCompleted : styles.glassCardActive,
        ]}
      >
        {/* Real Frosted Glass Blur */}
        <BlurView
          intensity={GLASS_TOKENS.blurIntensityCard}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        {/* Top Edge Refraction Line */}
        <LinearGradient
          colors={todo.completed ? GLASS_TOKENS.sheenGradientSubtle : GLASS_TOKENS.sheenGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.specularLine}
        />

        <View style={styles.topRow}>
          {/* Checkbox with Accent */}
          <Animated.View
            style={[
              styles.checkboxContainer,
              todo.completed
                ? [styles.checkboxCompleted, { backgroundColor: theme.primary, borderColor: theme.primary }]
                : styles.checkboxIncomplete,
              { transform: [{ scale: checkScale }] },
            ]}
          >
            {todo.completed ? (
              <Feather name="check" size={13} color={theme.onPrimary} />
            ) : (
              <View style={[styles.emptyDot, { borderColor: theme.primary }]} />
            )}
          </Animated.View>

          {/* Task Title */}
          <Text
            style={[
              styles.todoText,
              todo.completed && styles.todoTextCompleted,
            ]}
            numberOfLines={2}
          >
            {todo.todo}
          </Text>

          {/* Delete Action Button */}
          <TouchableOpacity
            onPress={() => {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
              onDelete(todo.id);
            }}
            style={styles.deleteButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="trash-2" size={15} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Meta row: Priority Badge, Date Badge, Status Pill */}
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            {/* Priority Badge */}
            <View
              style={[
                styles.badge,
                { backgroundColor: priorityConfig.bg, borderColor: priorityConfig.border },
              ]}
            >
              <Feather
                name={priorityConfig.icon}
                size={11}
                color={priorityConfig.text}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.badgeText, { color: priorityConfig.text }]}>
                {priorityConfig.label}
              </Text>
            </View>

            {/* Date Badge */}
            {todo.date ? (
              <View style={styles.dateBadge}>
                <Feather name="calendar" size={11} color={theme.primary} style={{ marginRight: 4 }} />
                <Text style={styles.dateBadgeText}>{todo.date}</Text>
              </View>
            ) : null}
          </View>

          {/* Frosted Glass Status Pill (done / to-do) */}
          <View
            style={[
              styles.statusPill,
              todo.completed
                ? styles.statusPillDone
                : [styles.statusPillTodo, { borderColor: `${theme.primary}55`, backgroundColor: theme.primaryContainer }],
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: todo.completed ? COLORS.success : theme.primary },
              ]}
            />
            <Text
              style={[
                styles.statusPillText,
                todo.completed
                  ? styles.statusTextDone
                  : { color: theme.onPrimaryContainer },
              ]}
            >
              {todo.status || (todo.completed ? 'done' : 'to-do')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

TodoItem.displayName = 'TodoItem';

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 5,
  },
  glassCard: {
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  glassCardActive: {
    backgroundColor: GLASS_TOKENS.cardGlassBg,
    borderColor: GLASS_TOKENS.glassBorderHighlight,
  },
  glassCardCompleted: {
    backgroundColor: GLASS_TOKENS.cardGlassCompletedBg,
    borderColor: GLASS_TOKENS.glassBorderCompleted,
    opacity: 0.78,
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
  },
  checkboxIncomplete: {
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkboxCompleted: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    opacity: 0.4,
  },
  todoText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F6FA',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#7E8497',
    fontWeight: '400',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 36,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C6CBDA',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  statusPillTodo: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusPillDone: {
    backgroundColor: 'rgba(14, 59, 39, 0.55)',
    borderColor: 'rgba(105, 226, 168, 0.40)',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  statusTextDone: {
    color: '#B3F7D2',
  },
});
