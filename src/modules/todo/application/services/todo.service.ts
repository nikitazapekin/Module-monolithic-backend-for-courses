// СЕРВИС ПРИЛОЖЕНИЯ - оркестрирует бизнес-процессы
import { Injectable, Inject } from '@nestjs/common';
import { Todo } from '../../domain/entities/todo.entity';
import { ITodoRepository } from '../../domain/interfaces/todo.repository.interface';

@Injectable()
export class TodoService {
  constructor(
    @Inject('ITodoRepository') // ✅ Внедряем по интерфейсу, не по классу!
    private readonly todoRepository: ITodoRepository,
  ) {}

  async createTodo(title: string, description?: string): Promise<any> {
    // 1. Создаем доменную сущность (валидация происходит в конструкторе)

    console.log('create ,', title, description);
    const todo = new Todo(title, description);
    console.log('TODO', todo);
    // 2. Сохраняем через репозиторий

  /*   return new Promise((resolve, reject)=> resolve({
  id: 'todo_1770306406619_yq6omv9oo',
  title: 'Тестовая задача',
  description: 'Описание тестовой задачи',
  isCompleted: false,
  createdAt: new Date,
 
}   )) */
  return this.todoRepository.save(todo);
  }

  async getTodoById(id: string): Promise<Todo | null> {
    return this.todoRepository.findById(id);
  }

  async getAllTodos(): Promise<Todo[]> {
    return this.todoRepository.findAll();
  }

  async completeTodo(id: string): Promise<Todo> {
    // 1. Находим задачу
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }

    // 2. Вызываем бизнес-метод доменной сущности
    todo.complete();

    // 3. Сохраняем изменения
    return this.todoRepository.save(todo);
  }
}
