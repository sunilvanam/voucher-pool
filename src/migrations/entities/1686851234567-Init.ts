// src/migrations/entities/1686851234567-Init.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1686851234567 implements MigrationInterface {
  name = 'Init1686851234567';

  async up(queryRunner: QueryRunner): Promise<any> {
    console.log('Running Init1686851234567');
    // Add your migration logic here
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    console.log('Reverting Init1686851234567');
    // Add your rollback logic here
  }
}
