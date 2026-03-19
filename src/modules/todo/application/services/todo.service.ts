 
import { Injectable, Inject } from '@nestjs/common';
import { Todo } from '../../domain/entities/todo.entity';
import { ITodoRepository } from '../../domain/interfaces/todo.repository.interface';

@Injectable()
export class TodoService {
  constructor(
    @Inject('ITodoRepository') 
    private readonly todoRepository: ITodoRepository,
  ) {}

  async createTodo(title: string, description?: string): Promise<any> {
 
    console.log('create ,', title, description);
    const todo = new Todo(title, description);
    console.log('TODO', todo);
    
    return this.todoRepository.save(todo);
  }

  async getTodoById(id: string): Promise<Todo | null> {
    return this.todoRepository.findById(id);
  }

  async getAllTodos(): Promise<Todo[]> {
    return this.todoRepository.findAll();
  }

  async completeTodo(id: string): Promise<Todo> {
    
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }
 
    todo.complete();
 
    return this.todoRepository.save(todo);
  }
}
