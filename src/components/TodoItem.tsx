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
import { Todo } from '../types/todo';
import { COLORS } from '../constants/theme';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = React.memo(({ todo, onToggle, onDelete }) => {
  const [cardScale] = useState(() => new Animated.Value(1));
  const [checkScale] = useState(() => new Animated.Value(todo.completed ? 1 : 0.85));

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
    // Pop animation on the checkbox
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
        <View style={styles.leftSection}>
          {/* Animated Expressive Checkbox Pill */}
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

          {/* Task title */}
          <Text
            style={[
              styles.todoText,
              todo.completed && styles.todoTextCompleted,
            ]}
            numberOfLines={2}
          >
            {todo.todo}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {todo.time ? (
            <View
              style={[
                styles.timeBadge,
                todo.completed && styles.timeBadgeCompleted,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  todo.completed && styles.timeTextCompleted,
                ]}
              >
                {todo.time}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => onDelete(todo.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="trash-2" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  cardCompleted: {
    backgroundColor: COLORS.cardCompleted,
    borderColor: COLORS.cardBorderCompleted,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBadge: {
    backgroundColor: COLORS.cardDarkElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeBadgeCompleted: {
    backgroundColor: '#121419',
    borderColor: '#1C1F28',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  timeTextCompleted: {
    color: COLORS.textMuted,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 12,
    opacity: 0.7,
  },
});
