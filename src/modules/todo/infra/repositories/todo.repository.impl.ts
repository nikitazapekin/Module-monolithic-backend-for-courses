 
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITodoRepository } from '../../domain/interfaces/todo.repository.interface';
import { Todo } from '../../domain/entities/todo.entity';
import { TodoOrmEntity } from '../typeorm/todo.orm-entity';

@Injectable()
export class TodoRepository implements ITodoRepository {
  constructor(
    @InjectRepository(TodoOrmEntity)
    private readonly ormRepository: Repository<TodoOrmEntity>,
  ) {}

  async save(todo: Todo): Promise<any> {
    
    const ormEntity = this.toOrmEntity(todo);
    const saved = await this.ormRepository.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Todo | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Todo[]> {
    const entities = await this.ormRepository.find();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByStatus(completed: boolean): Promise<Todo[]> {
    const entities = await this.ormRepository.find({
      where: { isCompleted: completed },
    });
    return entities.map((entity) => this.toDomain(entity));
  }
  async delete(id: string): Promise<boolean> {
    return false;
  }
  
  async findIncomplete(): Promise<Todo[]> {
    return this.findByStatus(false);
  }

  async markAllAsCompleted(): Promise<number> {
    return 1;
  }
 
  private toOrmEntity(todo: Todo): TodoOrmEntity {
    const entity = new TodoOrmEntity();
    entity.id = todo.id;
    entity.title = todo.title;
    entity.description = todo.description;
    entity.isCompleted = todo.isCompleted;
    entity.createdAt = todo.createdAt;
    entity.updatedAt = todo.updatedAt;
    return entity;
  }

  private toDomain(entity: TodoOrmEntity): Todo {
    const todo = new Todo(entity.title, entity.description, entity.id);
 
    if (entity.isCompleted) {
      todo.complete();
    }
 
    Object.assign(todo, {
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return todo;
  }
}
