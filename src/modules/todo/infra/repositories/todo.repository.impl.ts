// РЕАЛИЗАЦИЯ РЕПОЗИТОРИЯ - адаптер для TypeORM
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
    // return "TESTTT"
    // Преобразуем доменную сущность в ORM сущность
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
  /*  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return result.affected > 0;
  }
 */
  async findIncomplete(): Promise<Todo[]> {
    return this.findByStatus(false);
  }

  async markAllAsCompleted(): Promise<number> {
    return 1;
  }
  /*   async markAllAsCompleted(): Promise<number> {
    const result = await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({ isCompleted: true })
      .where('isCompleted = :completed', { completed: false })
      .execute();
    
    return result.affected;
  } */

  // ✅ ПРЕОБРАЗОВАНИЯ (маппинг)
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

    // Восстанавливаем состояние
    if (entity.isCompleted) {
      todo.complete();
    }

    // Восстанавливаем даты (приватные поля, нужен рефлексия или сеттеры)
    Object.assign(todo, {
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return todo;
  }
}
