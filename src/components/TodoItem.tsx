import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Todo, Priority } from '../types/todo';
import { COLORS } from '../constants/theme';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

function getPriorityBadgeConfig(priority: Priority = 'medium') {
  switch (priority) {
    case 'high':
      return {
        label: 'High',
        bg: COLORS.priorityHighBg,
        border: COLORS.priorityHighBorder,
        text: COLORS.priorityHighText,
        icon: 'alert-circle',
      };
    case 'medium':
      return {
        label: 'Med',
        bg: COLORS.priorityMedBg,
        border: COLORS.priorityMedBorder,
        text: COLORS.priorityMedText,
        icon: 'clock',
      };
    case 'low':
      return {
        label: 'Low',
        bg: COLORS.priorityLowBg,
        border: COLORS.priorityLowBorder,
        text: COLORS.priorityLowText,
        icon: 'arrow-down',
      };
  }
}

export const TodoItem: React.FC<TodoItemProps> = React.memo(({ todo, onToggle, onDelete }) => {
  const [cardScale] = useState(() => new Animated.Value(1));
  const [checkScale] = useState(() => new Animated.Value(todo.completed ? 1 : 0.85));

  const priorityConfig = getPriorityBadgeConfig(todo.priority);

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
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
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.3,
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
    Alert.alert(
      'Видалити завдання?',
      `Видалити "${todo.todo}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Видалити', style: 'destructive', onPress: () => onDelete(todo.id) },
      ]
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleToggleWithAnimation}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        style={[
          styles.card,
          todo.completed && styles.cardCompleted,
        ]}
      >
        <View style={styles.topRow}>
          {/* Checkbox & Title */}
          <Animated.View
            style={[
              styles.checkboxContainer,
              todo.completed ? styles.checkboxCompleted : styles.checkboxIncomplete,
              { transform: [{ scale: checkScale }] },
            ]}
          >
            {todo.completed ? (
              <Feather name="check" size={14} color="#00391C" />
            ) : (
              <View style={styles.emptyDot} />
            )}
          </Animated.View>

          <Text
            style={[
              styles.todoText,
              todo.completed && styles.todoTextCompleted,
            ]}
            numberOfLines={2}
          >
            {todo.todo}
          </Text>

          <TouchableOpacity
            onPress={() => onDelete(todo.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Bottom meta row: Priority, Date, Status */}
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
                name={priorityConfig.icon as any}
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
                <Feather name="calendar" size={11} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.dateBadgeText}>{todo.date}</Text>
              </View>
            ) : null}
          </View>

          {/* Status pill: done / to-do */}
          <View style={[styles.statusPill, todo.completed ? styles.statusPillDone : styles.statusPillTodo]}>
            <Text style={[styles.statusPillText, todo.completed ? styles.statusTextDone : styles.statusTextTodo]}>
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
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  cardCompleted: {
    backgroundColor: COLORS.cardCompleted,
    borderColor: COLORS.cardBorderCompleted,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
  },
  checkboxIncomplete: {
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  todoText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLight,
    flex: 1,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 38,
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
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDarkElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSubtitle,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillTodo: {
    backgroundColor: '#19263D',
  },
  statusPillDone: {
    backgroundColor: '#0E3B27',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusTextTodo: {
    color: COLORS.primary,
  },
  statusTextDone: {
    color: COLORS.success,
  },
});
