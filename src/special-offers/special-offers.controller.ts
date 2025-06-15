import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SpecialOffersService } from './special-offers.service';
import { CreateSpecialOfferDto } from './dto/create-special-offer.dto';

@Controller('special-offers')
export class SpecialOffersController {
  constructor(private readonly specialOffersService: SpecialOffersService) {}

  @Post()
  create(@Body() input: CreateSpecialOfferDto) {
    return this.specialOffersService.createOrUpdate(input);
  }

  @Get()
  findAll() {
    return this.specialOffersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specialOffersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: CreateSpecialOfferDto) {
    return this.specialOffersService.createOrUpdate(input, +id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specialOffersService.remove(+id);
  }
}
