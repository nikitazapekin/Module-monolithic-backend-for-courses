import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateForumTables1710000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasQuestionsTable = await queryRunner.hasTable('forum_questions');

    if (!hasQuestionsTable) {
      await queryRunner.createTable(
        new Table({
          name: 'forum_questions',
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'title', type: 'varchar' },
            { name: 'content', type: 'text' },
            { name: 'tags', type: 'text' },
            { name: 'status', type: 'varchar', default: "'open'" },
            { name: 'authorId', type: 'varchar' },
            { name: 'authorName', type: 'varchar' },
            { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          ],
        }),
      );
    }

    const hasCommentsTable = await queryRunner.hasTable('forum_comments');

    if (!hasCommentsTable) {
      await queryRunner.createTable(
        new Table({
          name: 'forum_comments',
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'questionId', type: 'varchar' },
            { name: 'authorId', type: 'varchar' },
            { name: 'authorName', type: 'varchar' },
            { name: 'content', type: 'text' },
            { name: 'parentId', type: 'varchar', isNullable: true },
            { name: 'likes', type: 'int', default: '0' },
            { name: 'dislikes', type: 'int', default: '0' },
            { name: 'likedByUsers', type: 'text', isNullable: true },
            { name: 'dislikedByUsers', type: 'text', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          ],
        }),
      );

      await queryRunner.createForeignKeys('forum_comments', [
        new TableForeignKey({
          columnNames: ['questionId'],
          referencedTableName: 'forum_questions',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
        new TableForeignKey({
          columnNames: ['parentId'],
          referencedTableName: 'forum_comments',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasCommentsTable = await queryRunner.hasTable('forum_comments');
    if (hasCommentsTable) {
      const commentsTable = await queryRunner.getTable('forum_comments');
      if (commentsTable?.foreignKeys.length) {
        await queryRunner.dropForeignKeys('forum_comments', commentsTable.foreignKeys);
      }
      await queryRunner.dropTable('forum_comments');
    }

    const hasQuestionsTable = await queryRunner.hasTable('forum_questions');
    if (hasQuestionsTable) {
      await queryRunner.dropTable('forum_questions');
    }
  }
}
