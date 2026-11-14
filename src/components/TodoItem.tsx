import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Checkbox, IconButton } from 'react-native-paper';
import { Todo } from '../types/todo';
import { COLORS } from '../constants/theme';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = React.memo(({ todo, onToggle, onDelete }) => {
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
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onToggle(todo.id)}
      onLongPress={handleLongPress}
      style={[
        styles.card,
        todo.completed && styles.cardCompleted,
      ]}
    >
      <View style={styles.leftContent}>
        <Checkbox.Android
          status={todo.completed ? 'checked' : 'unchecked'}
          onPress={() => onToggle(todo.id)}
          color={COLORS.success}
          uncheckedColor={COLORS.textMuted}
        />
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

      <View style={styles.rightContent}>
        {todo.time ? (
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{todo.time}</Text>
          </View>
        ) : null}

        <IconButton
          icon="delete-outline"
          iconColor={COLORS.textMuted}
          size={20}
          onPress={() => onDelete(todo.id)}
          style={styles.deleteBtn}
        />
      </View>
    </TouchableOpacity>
  );
});

TodoItem.displayName = 'TodoItem';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardCompleted: {
    backgroundColor: '#141518',
    borderColor: '#1F2126',
    opacity: 0.85,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  todoText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
    flex: 1,
    marginLeft: 6,
    lineHeight: 20,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBadge: {
    backgroundColor: COLORS.cardDarkElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteBtn: {
    margin: 0,
  },
});
