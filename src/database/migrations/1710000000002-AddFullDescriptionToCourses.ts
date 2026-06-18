import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFullDescriptionToCourses1710000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('courses', 'fullDescription');

    if (hasColumn) {
      return;
    }

    await queryRunner.addColumn(
      'courses',
      new TableColumn({
        name: 'fullDescription',
        type: 'text',
        isNullable: false,
        default: "''",
      }),
    );

    await queryRunner.query(`
      UPDATE "courses"
      SET "fullDescription" = description
      WHERE COALESCE(TRIM("fullDescription"), '') = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('courses', 'fullDescription');

    if (!hasColumn) {
      return;
    }

    await queryRunner.dropColumn('courses', 'fullDescription');
  }
}
