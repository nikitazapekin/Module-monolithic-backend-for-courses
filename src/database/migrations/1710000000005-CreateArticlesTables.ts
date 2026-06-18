import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateArticlesTables1710000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasArticlesTable = await queryRunner.hasTable('articles');

    if (!hasArticlesTable) {
      await queryRunner.createTable(
        new Table({
          name: 'articles',
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'title', type: 'varchar' },
            { name: 'tags', type: 'text' },
            { name: 'authorId', type: 'varchar' },
            { name: 'authorName', type: 'varchar' },
            { name: 'contentBlocks', type: 'text' },
            { name: 'likes', type: 'int', default: '0' },
            { name: 'dislikes', type: 'int', default: '0' },
            { name: 'likedByUsers', type: 'text', isNullable: true },
            { name: 'dislikedByUsers', type: 'text', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          ],
        }),
      );
    }

    const hasCommentsTable = await queryRunner.hasTable('article_comments');

    if (!hasCommentsTable) {
      await queryRunner.createTable(
        new Table({
          name: 'article_comments',
          columns: [
            { name: 'id', type: 'varchar', isPrimary: true },
            { name: 'articleId', type: 'varchar' },
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

      await queryRunner.createForeignKeys('article_comments', [
        new TableForeignKey({
          columnNames: ['articleId'],
          referencedTableName: 'articles',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
        new TableForeignKey({
          columnNames: ['parentId'],
          referencedTableName: 'article_comments',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasCommentsTable = await queryRunner.hasTable('article_comments');
    if (hasCommentsTable) {
      const commentsTable = await queryRunner.getTable('article_comments');
      if (commentsTable?.foreignKeys.length) {
        await queryRunner.dropForeignKeys(
          'article_comments',
          commentsTable.foreignKeys,
        );
      }
      await queryRunner.dropTable('article_comments');
    }

    const hasArticlesTable = await queryRunner.hasTable('articles');
    if (hasArticlesTable) {
      await queryRunner.dropTable('articles');
    }
  }
}
