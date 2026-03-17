// МОДУЛЬ NESTJS - собирает всё вместе
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { TodoController } from '@modules/interfaces/http/todo.controller';
import { TodoService } from './application/services/todo.service';
import { TodoFacade } from './application/facades/todo.facade';
import { TodoRepository } from './infra/repositories/todo.repository.impl';
import { TodoOrmEntity } from './infra/typeorm/todo.orm-entity';

// Импортируем все обработчики
import { CreateTodoHandler } from './application/handlers/create-todo.handler';
import { CompleteTodoHandler } from './application/handlers/complete-todo.handler';
/* import { GetTodoByIdHandler } from './application/query-handlers/get-todo-by-id.handler';
import { GetAllTodosHandler } from './application/query-handlers/get-all-todos.handler'; */

const CommandHandlers = [CreateTodoHandler, CompleteTodoHandler];
//const QueryHandlers = [GetTodoByIdHandler, GetAllTodosHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoOrmEntity]), // Подключаем TypeORM
    CqrsModule, // Подключаем CQRS
  ],
  controllers: [TodoController], // Контроллеры
  providers: [
    TodoService,
    TodoFacade,
    // ✅ Регистрируем репозиторий по интерфейсу
    {
      provide: 'ITodoRepository',
      useClass: TodoRepository,
    },
    // ✅ Регистрируем обработчики CQRS
    ...CommandHandlers,
    //...QueryHandlers,
  ],
  exports: [
    TodoService,
    TodoFacade, // ✅ Экспортируем фасад для других модулей
  ],
})
export class TodoModule {}
