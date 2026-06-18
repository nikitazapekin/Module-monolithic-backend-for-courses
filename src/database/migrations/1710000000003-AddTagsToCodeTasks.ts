import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTagsToCodeTasks1710000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('code_tasks', 'tags');

    if (hasColumn) {
      return;
    }

    await queryRunner.addColumn(
      'code_tasks',
      new TableColumn({
        name: 'tags',
        type: 'jsonb',
        isNullable: false,
        default: "'[]'",
      }),
    );

    await queryRunner.query(`
      UPDATE "code_tasks"
      SET "tags" = '[]'::jsonb
      WHERE "tags" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('code_tasks', 'tags');

    if (!hasColumn) {
      return;
    }

    await queryRunner.dropColumn('code_tasks', 'tags');
  }
}
