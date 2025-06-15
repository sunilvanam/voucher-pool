import { Module } from '@nestjs/common';
import { SpecialOffersService } from './special-offers.service';
import { SpecialOffersController } from './special-offers.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SpecialOffersController],
  providers: [SpecialOffersService],
  exports: [SpecialOffersService],
})
export class SpecialOffersModule {}
