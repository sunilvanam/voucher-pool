import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DataSource,
  DataSourceOptions,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  private connectionManager = new Map<string, DataSource>();
  private logger: any;

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.connectionManager = new Map<string, DataSource>();
  }

  public getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Repository<T> {
    return this.dataSource.getRepository(entity);
  }

  public async withTransaction<T>(
    fn: (manager: DataSource['manager']) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(fn);
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }
  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return DatabaseService.getTypeOrmConfig(this.configService);
  }

  public static getTypeOrmConfig(
    config: ConfigService,
    overrides = {},
  ): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: config.get<string>('POSTGRES_HOST'),
      port: config.get<number>('POSTGRES_PORT'),
      username: config.get<string>('POSTGRES_USER'),
      password: config.get<string>('POSTGRES_PASSWORD'),
      database: config.get<string>('POSTGRES_DB'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: config.get<boolean>('TYPEORM_SYNC', false),
      migrationsTableName: 'migrations',
      // migrations: [__dirname + '/../migrations/*.{js,ts}'],
      logging: false,
      ...overrides,
    };
  }
}
