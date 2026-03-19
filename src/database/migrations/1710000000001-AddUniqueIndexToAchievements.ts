import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddUniqueIndexToAchievements1710000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
  
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
 
    await queryRunner.dropIndex('achievements', 'IDX_ACHIEVEMENTS_CLIENT_TIER');
  }
}
