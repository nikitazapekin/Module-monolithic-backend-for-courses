import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILessonCommentRepository } from '../../domain/interfaces/lesson-comment.repository.interface';
import { LessonComment } from '../../domain/entities/lesson-comment.entity';
import { LessonCommentOrmEntity } from '../typeorm/lesson-comment.orm-entity';

@Injectable()
export class LessonCommentRepository implements ILessonCommentRepository {
  constructor(
    @InjectRepository(LessonCommentOrmEntity)
    private readonly repository: Repository<LessonCommentOrmEntity>,
  ) {}

  async findById(id: string): Promise<LessonComment | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAllByLessonDetailsId(
    lessonDetailsId: string,
  ): Promise<LessonComment[]> {
    const entities = await this.repository.find({
      where: { lessonDetailsId },
      order: { createdAt: 'ASC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findRepliesByParentId(parentId: string): Promise<LessonComment[]> {
    const entities = await this.repository.find({
      where: { parentId },
      order: { createdAt: 'ASC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async create(comment: LessonComment): Promise<LessonComment> {
    const entity = this.toOrm(comment);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, comment: LessonComment): Promise<boolean> {
    await this.repository.update(id, {
      content: comment.content,
      likes: comment.likes,
      dislikes: comment.dislikes,
      likedByUsers: comment.likedByUsers,
      dislikedByUsers: comment.dislikedByUsers,
      updatedAt: comment.updatedAt,
    });
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return !!result.affected;
  }

  async deleteAllByLessonDetailsId(lessonDetailsId: string): Promise<boolean> {
    const result = await this.repository.delete({ lessonDetailsId });
    return !!result.affected;
  }
  private toDomain(entity: LessonCommentOrmEntity): LessonComment {
    const comment = new LessonComment(
      entity.lessonDetailsId,
      entity.userId,
      entity.content,
      entity.parentId,
      entity.id,
    );
    comment.likes = entity.likes;
    comment.dislikes = entity.dislikes;
    comment.likedByUsers = entity.likedByUsers || [];
    comment.dislikedByUsers = entity.dislikedByUsers || [];
    comment.createdAt = entity.createdAt;
    comment.updatedAt = entity.updatedAt;
    return comment;
  }

  private toOrm(comment: LessonComment): LessonCommentOrmEntity {
    const entity = new LessonCommentOrmEntity();
    entity.id = comment.id;
    entity.lessonDetailsId = comment.lessonDetailsId;
    entity.userId = comment.userId;
    entity.content = comment.content;
    entity.parentId = comment.parentId;
    entity.likes = comment.likes;
    entity.dislikes = comment.dislikes;
    entity.likedByUsers = comment.likedByUsers;
    entity.dislikedByUsers = comment.dislikedByUsers;
    entity.createdAt = comment.createdAt;
    entity.updatedAt = comment.updatedAt;
    return entity;
  }
}
