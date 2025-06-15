import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { DatabaseModule } from '../database/database.module';
import { SpecialOffersModule } from '../special-offers/special-offers.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [DatabaseModule, SpecialOffersModule, CustomersModule],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
