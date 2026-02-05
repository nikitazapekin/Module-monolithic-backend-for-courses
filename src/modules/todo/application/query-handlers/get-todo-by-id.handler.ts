import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTodoByIdQuery } from '../queries/get-todo-by-id.query';
import { TodoService } from '../services/todo.service';

@QueryHandler(GetTodoByIdQuery)
export class GetTodoByIdHandler implements IQueryHandler<GetTodoByIdQuery> {
  constructor(private readonly todoService: TodoService) {}

  async execute(query: GetTodoByIdQuery): Promise<any> {
    return this.todoService.getTodoById(query.todoId);
  }
}
