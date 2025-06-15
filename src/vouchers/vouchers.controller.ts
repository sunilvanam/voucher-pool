import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import {
  GenerateVouchersDto,
  ValidateVoucherDto,
  ValidateVoucherResponseDto,
  VoucherResponseDto,
} from './dto/voucher.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get()
  findAll() {
    return this.vouchersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(+id);
  }

  @Post('generate-voucher')
  async generateVoucherCode(@Body() generateVouchers: GenerateVouchersDto) {
    return this.vouchersService.generateVoucherCode(generateVouchers);
  }

  @Post('validate')
  async validateVoucher(
    @Body() input: ValidateVoucherDto,
  ): Promise<ValidateVoucherResponseDto> {
    return this.vouchersService.validateAndRedeemVoucher(input, false);
  }

  @Post('redeem')
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 10 requests per minute for validation
  @ApiOperation({ summary: 'Validate and redeem a voucher' })
  @ApiResponse({
    status: 200,
    description: 'Voucher validation result',
    type: ValidateVoucherResponseDto,
  })
  async redeemVoucher(
    @Body() input: ValidateVoucherDto,
  ): Promise<ValidateVoucherResponseDto> {
    return this.vouchersService.validateAndRedeemVoucher(input, true);
  }

  @Get('customer-vouchers/:email')
  async getCustomerVouchers(
    @Param('email') email: string,
  ): Promise<VoucherResponseDto[]> {
    return this.vouchersService.getCustomerVouchers(email);
  }
}
