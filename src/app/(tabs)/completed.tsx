import React from 'react';
import { TodoListScreen } from '@/components/TodoListScreen';

/**
 * Tab displaying completed tasks.
 */
export default function CompletedTodosTab() {
  return <TodoListScreen filter="completed" />;
}
