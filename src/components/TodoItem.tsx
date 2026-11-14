import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Todo } from '../types/todo';
import { COLORS } from '../constants/theme';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  const handleLongPress = () => {
    Alert.alert(
      'Видалити завдання?',
      `Ви впевнені, що хочете видалити "${todo.todo}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Видалити', style: 'destructive', onPress: () => onDelete(todo.id) },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(todo.id)}
      onLongPress={handleLongPress}
      style={[
        styles.card,
        todo.completed && styles.cardCompleted,
      ]}
    >
      <View style={styles.leftSection}>
        {/* Checkmark circle or subtle empty radio indicator */}
        <TouchableOpacity
          onPress={() => onToggle(todo.id)}
          style={[
            styles.checkCircle,
            todo.completed ? styles.checkCircleCompleted : styles.checkCircleIncomplete,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {todo.completed && (
            <Feather name="check" size={13} color={COLORS.white} />
          )}
        </TouchableOpacity>

        {/* Task description */}
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

      {/* Right side: Time display */}
      <View style={styles.rightSection}>
        <Text style={[styles.timeText, todo.completed && styles.timeTextCompleted]}>
          {todo.time || '12 pm'}
        </Text>

        <TouchableOpacity
          onPress={() => onDelete(todo.id)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="trash-2" size={14} color={COLORS.iconInactive} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginHorizontal: 20,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // iOS shadow
    shadowColor: '#50668F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android elevation
    elevation: 2.5,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardCompleted: {
    backgroundColor: '#FCFDFF',
    borderColor: '#EEF2F6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkCircleCompleted: {
    backgroundColor: COLORS.success,
  },
  checkCircleIncomplete: {
    borderWidth: 1.5,
    borderColor: '#D4DCED',
    backgroundColor: 'transparent',
  },
  todoText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textBody,
    flex: 1,
    letterSpacing: -0.2,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textTime,
    letterSpacing: -0.2,
    marginRight: 8,
  },
  timeTextCompleted: {
    color: COLORS.textMuted,
  },
  deleteButton: {
    padding: 2,
    opacity: 0.6,
  },
});
