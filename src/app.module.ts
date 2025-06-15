import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { VouchersModule } from './vouchers/vouchers.module';
import { SpecialOffersModule } from './special-offers/special-offers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CustomersModule,
    DatabaseModule,
    VouchersModule,
    SpecialOffersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
