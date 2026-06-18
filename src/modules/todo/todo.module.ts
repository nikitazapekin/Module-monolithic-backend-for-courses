 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { TodoController } from '@modules/interfaces/http/todo.controller';
import { TodoService } from './application/services/todo.service';
import { TodoFacade } from './application/facades/todo.facade';
import { TodoRepository } from './infra/repositories/todo.repository.impl';
import { TodoOrmEntity } from './infra/typeorm/todo.orm-entity';
 
import { CreateTodoHandler } from './application/handlers/create-todo.handler';
import { CompleteTodoHandler } from './application/handlers/complete-todo.handler';
 
const CommandHandlers = [CreateTodoHandler, CompleteTodoHandler];
 
@Module({
  imports: [
    TypeOrmModule.forFeature([TodoOrmEntity]),  
    CqrsModule, 
  ],
  controllers: [TodoController], 
  providers: [
    TodoService,
    TodoFacade,
    
    {
      provide: 'ITodoRepository',
      useClass: TodoRepository,
    },
    
    ...CommandHandlers,
    
  ],
  exports: [
    TodoService,
    TodoFacade, 
  ],
})
export class TodoModule {}
