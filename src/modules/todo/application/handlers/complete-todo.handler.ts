import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteTodoCommand } from '../commands/complete-todo.command';
import { TodoService } from '../services/todo.service';
import { TodoDto } from '../dtos/todo.dto';
import { plainToInstance } from 'class-transformer';

@CommandHandler(CompleteTodoCommand)
export class CompleteTodoHandler implements ICommandHandler<CompleteTodoCommand> {
  constructor(private readonly todoService: TodoService) {}

  async execute(command: CompleteTodoCommand): Promise<TodoDto> {
    // 1. Вызываем сервис для завершения задачи
    const todo = await this.todoService.completeTodo(command.todoId);
    
    // 2. Преобразуем в DTO для ответа
    return this.toDto(todo);
  }
  
  private toDto(todo: any): TodoDto {
    return plainToInstance(TodoDto, {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    });
  }
}
