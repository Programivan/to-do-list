export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'to-do' | 'done';

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  status: TaskStatus;
  date: string;
  priority: Priority;
  userId: number;
  time?: string;
  isDeleted?: boolean;
}

export interface TodoFormData {
  title: string;
  date: string;
  priority: Priority;
  status?: TaskStatus;
}

export interface TodosResponse {
  todos: {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
  }[];
  total: number;
  skip: number;
  limit: number;
}

export type TabType = 'all' | 'pending' | 'completed' | 'profile';
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
