// ФАСАД - публичное API для других модулей
import { Injectable } from '@nestjs/common';
import { TodoService } from '../services/todo.service';
import { TodoDto } from '../dtos/todo.dto';
import { plainToInstance } from 'class-transformer';
import { Todo } from '@modules/todo/domain/entities/todo.entity';

@Injectable()
export class TodoFacade {
  constructor(private readonly todoService: TodoService) {}

  // ✅ Только публичные методы! Скрываем внутреннюю сложность
  async createTodo(title: string, description?: string): Promise<TodoDto> {
    const todo = await this.todoService.createTodo(title, description);
    return this.toDto(todo);
  }

  async getTodo(id: string): Promise<TodoDto | null> {
    const todo = await this.todoService.getTodoById(id);
    return todo ? this.toDto(todo) : null;
  }

  async getIncompleteTodos(): Promise<TodoDto[]> {
    // Если в сервисе нет такого метода, добавляем
    const todos = await this.todoService.getAllTodos();
    const incomplete = todos.filter((t) => !t.isCompleted);
    return incomplete.map((t) => this.toDto(t));
  }

  // ✅ Преобразование доменной сущности в DTO
  private toDto(todo: Todo): TodoDto {
    return plainToInstance(TodoDto, {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    });
  }
}
