import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSpecialOfferDto {
  @ApiProperty({
    description: 'Name of the special offer',
    example: 'Summer Sale 2024',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Discount percentage (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;
}
