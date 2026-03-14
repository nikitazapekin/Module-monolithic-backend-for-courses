import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAchievementsTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create achievements table
    await queryRunner.createTable(
      new Table({
        name: 'achievements',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'clientId',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['student_results', 'solved_tasks'],
          },
          {
            name: 'tier',
            type: 'enum',
            enum: ['novice', 'advanced', 'expert', 'master', 'beginner', 'intermediate', 'professional', 'legendary'],
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'image',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'earnedAt',
            type: 'timestamp',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key to clients table
    await queryRunner.createForeignKey(
      'achievements',
      new TableForeignKey({
        columnNames: ['clientId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clients',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const table = await queryRunner.getTable('achievements');
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('clientId'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('achievements', foreignKey);
    }

    // Drop achievements table
    await queryRunner.dropTable('achievements');
  }
}
