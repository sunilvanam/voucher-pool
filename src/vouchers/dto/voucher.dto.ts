import {
  IsNotEmpty,
  IsDateString,
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateVouchersDto {
  @ApiProperty({
    description: 'Special Offer ID',
    example: '1',
  })
  @IsNotEmpty()
  specialOfferId: string;

  @ApiProperty({
    description: 'Expiration date for the vouchers',
    example: '2024-12-31T23:59:59Z',
  })
  @IsNotEmpty()
  @IsDateString()
  expirationDate: string;
}

export class ValidateVoucherDto {
  @ApiProperty({
    description: 'Voucher code',
    example: 'SUMMER2024XYZ',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  code: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'test@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class VoucherResponseDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  specialOfferName: string;

  @ApiProperty()
  discountPercentage: number;

  @ApiProperty()
  expirationDate: Date;

  @ApiProperty()
  isValid: boolean;
}

export class ValidateVoucherResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  discountPercentage?: number;

  @ApiProperty()
  message: string;
}
