import { Todo, TodosResponse } from '../types/todo';
import { getTaskTime } from '../constants/theme';

const BASE_URL = 'https://dummyjson.com/todos';

export async function fetchTodos(limit: number = 30, skip: number = 0): Promise<{ todos: Todo[]; total: number }> {
  try {
    const response = await fetch(`${BASE_URL}?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data: TodosResponse = await response.json();
    
    // Assign mock times matching the visual layout if not present
    const enrichedTodos = data.todos.map((item, index) => ({
      ...item,
      time: item.time || getTaskTime(skip + index, item.id),
    }));

    return { todos: enrichedTodos, total: data.total };
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

export async function addTodoApi(todoText: string, time?: string): Promise<Todo> {
  try {
    const response = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo: todoText,
        completed: false,
        userId: 1,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add todo: ${response.status}`);
    }

    const created: Todo = await response.json();
    return {
      ...created,
      time: time || '12 pm',
    };
  } catch (error) {
    console.error('Error adding todo to server, using local fallback:', error);
    // Local fallback in case network has issues
    return {
      id: Date.now(),
      todo: todoText,
      completed: false,
      userId: 1,
      time: time || '12 pm',
    };
  }
}

export async function toggleTodoApi(id: number, completed: boolean): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error updating todo ${id}:`, error);
    return false;
  }
}

export async function deleteTodoApi(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error(`Error deleting todo ${id}:`, error);
    return false;
  }
}
