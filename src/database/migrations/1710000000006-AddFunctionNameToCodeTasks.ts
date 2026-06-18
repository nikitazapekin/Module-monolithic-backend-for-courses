import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFunctionNameToCodeTasks1710000000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('code_tasks', 'functionName');

    if (hasColumn) {
      return;
    }

    await queryRunner.addColumn(
      'code_tasks',
      new TableColumn({
        name: 'functionName',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('code_tasks', 'functionName');

    if (!hasColumn) {
      return;
    }

    await queryRunner.dropColumn('code_tasks', 'functionName');
  }
}
