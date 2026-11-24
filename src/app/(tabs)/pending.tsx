import React from 'react';
import { TodoListScreen } from '@/components/TodoListScreen';

/**
 * Tab displaying active (pending) tasks.
 */
export default function PendingTodosTab() {
  return <TodoListScreen filter="pending" />;
}
