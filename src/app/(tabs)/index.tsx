import React from 'react';
import { TodoListScreen } from '@/components/TodoListScreen';

/**
 * Default tab displaying all tasks.
 */
export default function AllTodosTab() {
  return <TodoListScreen filter="all" />;
}
