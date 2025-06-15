import { BootstrapConsole } from 'nestjs-console';
import { MigrationModule } from './migrations/migration.module';

const bootstrap = new BootstrapConsole({
  module: MigrationModule,
  useDecorators: true,
});

void bootstrap.init().then(async (app) => {
  try {
    // init your app
    await app.init();
    // boot the cli
    await bootstrap.boot();
    process.exit(0);
  } catch (e: unknown) {
    console.error('Failed to initialize:', e);
    process.exit(1);
  }
});
