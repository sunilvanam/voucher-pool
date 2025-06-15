import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { ConsoleModule } from 'nestjs-console';
import { MigrationService } from './migration.service';

@Module({
  imports: [
    ConsoleModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}
