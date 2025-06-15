import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        DatabaseService.getTypeOrmConfig(config),
    }),
  ],
  exports: [DatabaseService],
  providers: [DatabaseService],
})
export class DatabaseModule {}
