 
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateTodoCommand } from '../commands/create-todo.command';
import { TodoService } from '../services/todo.service';
import { TodoCreatedEvent } from '../../domain/events/todo-created.event';

@CommandHandler(CreateTodoCommand)
export class CreateTodoHandler implements ICommandHandler<CreateTodoCommand> {
  constructor(
    private readonly todoService: TodoService,
    private readonly eventBus: EventBus, 
  ) {}

  async execute(command: CreateTodoCommand): Promise<any> {
    

    console.log('COMMAND', command);
    const todo = await this.todoService.createTodo(
      command.title,
      command.description,
    );
 
    return todo;
  }
}
