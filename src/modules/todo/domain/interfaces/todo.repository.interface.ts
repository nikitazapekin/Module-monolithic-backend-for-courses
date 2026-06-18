 
import { Todo } from '../entities/todo.entity';

export interface ITodoRepository {
 
  save(todo: Todo): Promise<Todo>;
  findById(id: string): Promise<Todo | null>;
  findAll(): Promise<Todo[]>;
  findByStatus(completed: boolean): Promise<Todo[]>;
  delete(id: string): Promise<boolean>;

 
  findIncomplete(): Promise<Todo[]>;
  markAllAsCompleted(): Promise<number>;
}
