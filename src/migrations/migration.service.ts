import { Console, Command } from 'nestjs-console';
import { DatabaseService } from '../database/database.service';
import { DataSource } from 'typeorm';

@Console()
export class MigrationService {
  constructor(private dbService: DatabaseService) {}

  @Command({ command: 'migration:run', description: 'Runs migrations' })
  async runMigrations() {
    const dataSource: DataSource = this.dbService.getDataSource();
    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations complete.');
  }

  @Command({ command: 'migration:undo', description: 'Reverts migrations' })
  async revertMigrations() {
    const dataSource: DataSource = this.dbService.getDataSource();
    console.log('Reverting migrations...');
    await dataSource.undoLastMigration();
    console.log('Revert complete.');
  }
}
