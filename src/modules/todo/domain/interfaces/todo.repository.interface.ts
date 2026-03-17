// ПОРТ - интерфейс, КАК мы хотим работать с данными
import { Todo } from '../entities/todo.entity';

export interface ITodoRepository {
  // ✅ CRUD операции
  save(todo: Todo): Promise<Todo>;
  findById(id: string): Promise<Todo | null>;
  findAll(): Promise<Todo[]>;
  findByStatus(completed: boolean): Promise<Todo[]>;
  delete(id: string): Promise<boolean>;

  // ✅ Специфичные операции
  findIncomplete(): Promise<Todo[]>;
  markAllAsCompleted(): Promise<number>;
}
