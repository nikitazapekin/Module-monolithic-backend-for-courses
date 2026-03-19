 
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateTodoCommand } from '@modules/todo/application/commands/create-todo.command';
import { CompleteTodoCommand } from '@modules/todo/application/commands/complete-todo.command';
import { GetTodoByIdQuery } from '@modules/todo/application/queries/get-todo-by-id.query';

import { CreateTodoDto } from '@modules/todo/application/dtos/create-todo.dto';

@ApiTags('todos')
@Controller('todos')
export class TodoController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
 

  @Get(':id')
  @ApiOperation({ summary: 'Get todo by ID' })
  async getTodoById(@Param('id') id: string) {
    return this.queryBus.execute(new GetTodoByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  async createTodo(@Body() createTodoDto: CreateTodoDto) {
    console.log('DTO', createTodoDto);
 
    return this.commandBus.execute(
      new CreateTodoCommand(createTodoDto.title, createTodoDto.description),
    );
  
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark todo as completed' })
  async completeTodo(@Param('id') id: string) {
    return this.commandBus.execute(new CompleteTodoCommand(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete todo' })
  async deleteTodo(@Param('id') id: string) {
   
    return { message: 'Todo deleted', id };
  }
}
