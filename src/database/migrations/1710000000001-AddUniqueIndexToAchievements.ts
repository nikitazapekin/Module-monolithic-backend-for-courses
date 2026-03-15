import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddUniqueIndexToAchievements1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add unique index on clientId and tier
    await queryRunner.createIndex(
      'achievements',
      new TableIndex({
        name: 'IDX_ACHIEVEMENTS_CLIENT_TIER',
        columnNames: ['clientId', 'tier'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop unique index
    await queryRunner.dropIndex('achievements', 'IDX_ACHIEVEMENTS_CLIENT_TIER');
  }
}
