export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
  time?: string;
  isDeleted?: boolean;
}

export interface TodosResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

export type TabType = 'all' | 'pending' | 'completed' | 'profile';
