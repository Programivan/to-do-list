import { Todo, TodosResponse, TodoFormData, Priority } from '../types/todo';
import { getTaskTime } from '../constants/theme';

const BASE_URL = 'https://dummyjson.com/todos';

const PRIORITIES: Priority[] = ['high', 'medium', 'low', 'medium', 'low'];

export async function fetchTodos(limit: number = 30, skip: number = 0): Promise<{ todos: Todo[]; total: number }> {
  try {
    const response = await fetch(`${BASE_URL}?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const data: TodosResponse = await response.json();
    
    const enrichedTodos: Todo[] = data.todos.map((item, index) => ({
      id: item.id,
      todo: item.todo,
      completed: item.completed,
      status: item.completed ? 'done' : 'to-do',
      priority: PRIORITIES[(item.id + index) % PRIORITIES.length],
      date: 'Today',
      userId: item.userId,
      time: getTaskTime(skip + index, item.id),
    }));

    return { todos: enrichedTodos, total: data.total };
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

export async function addTodoApi(formData: TodoFormData): Promise<Todo> {
  try {
    const response = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo: formData.title,
        completed: false,
        userId: 1,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add todo: ${response.status}`);
    }

    const created = await response.json();
    return {
      id: created.id,
      todo: formData.title,
      completed: false,
      status: 'to-do',
      date: formData.date,
      priority: formData.priority,
      userId: 1,
      time: '12 pm',
    };
  } catch (error) {
    console.error('Error adding todo to server, using local fallback:', error);
    return {
      id: Date.now(),
      todo: formData.title,
      completed: false,
      status: 'to-do',
      date: formData.date,
      priority: formData.priority,
      userId: 1,
      time: '12 pm',
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
