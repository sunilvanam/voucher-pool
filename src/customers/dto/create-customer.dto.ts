import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
export class CreateCustomerDto {
  @ApiProperty({
    description: 'The name of the customer',
    example: 'John Doe',
    type: String,
    maxLength: 255,
    minLength: 1,
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The email of the customer',
    example: 'john@example.com',
    type: String,
    maxLength: 255,
    minLength: 5,
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString()
  email: string;
}
