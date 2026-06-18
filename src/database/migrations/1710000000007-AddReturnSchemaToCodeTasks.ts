import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddReturnSchemaToCodeTasks1710000000007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('code_tasks', 'returnSchema');

    if (hasColumn) {
      return;
    }

    await queryRunner.addColumn(
      'code_tasks',
      new TableColumn({
        name: 'returnSchema',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('code_tasks', 'returnSchema');

    if (!hasColumn) {
      return;
    }

    await queryRunner.dropColumn('code_tasks', 'returnSchema');
  }
}
