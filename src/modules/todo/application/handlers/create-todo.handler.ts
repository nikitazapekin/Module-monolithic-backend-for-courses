// ОБРАБОТЧИК КОМАНДЫ - знает КАК выполнить команду
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateTodoCommand } from '../commands/create-todo.command';
import { TodoService } from '../services/todo.service';
import { TodoCreatedEvent } from '../../domain/events/todo-created.event';

@CommandHandler(CreateTodoCommand)
export class CreateTodoHandler implements ICommandHandler<CreateTodoCommand> {
  constructor(
    private readonly todoService: TodoService,
    private readonly eventBus: EventBus, // Для публикации событий
  ) {}

  async execute(command: CreateTodoCommand): Promise<any> {
    // 1. Вызываем сервис для создания

    console.log('COMMAND', command);
    const todo = await this.todoService.createTodo(
      command.title,
      command.description,
    );

    /*   // 2. Публикуем событие (для других модулей)
    await this.eventBus.publish(
      new TodoCreatedEvent(todo.id, todo.title, new Date())
    );
     */
    // 3. Возвращаем результат
    return todo;
  }
}
