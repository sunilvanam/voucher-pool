import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CustomersService {
  private customerRepository: Repository<Customer>;
  constructor(private readonly db: DatabaseService) {
    this.customerRepository = this.db.getRepository(Customer);
  }
  async createOrUpdate(
    input: CreateCustomerDto,
    id?: number,
  ): Promise<Customer> {
    let customer;
    if (id) {
      const existingCustomer = await this.customerRepository.findOneBy({ id });
      if (!existingCustomer)
        throw new NotFoundException(`Customer with ID ${id} not found`);

      if (input.email && input.email !== existingCustomer.email) {
        await this.checkEmailExists(input.email);
      }
      customer = Object.assign(existingCustomer, input);
    } else {
      await this.checkEmailExists(input.email);
      customer = this.customerRepository.create(input);
    }
    return this.customerRepository.save(customer) as Promise<Customer>;
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }

    return customer;
  }

  async remove(id: number): Promise<boolean> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const res = await this.customerRepository.delete(id);
    if (res && res.affected && res.affected > 0) return true;
    return false;
  }

  private async checkEmailExists(email: string) {
    const existing = await this.customerRepository.findOneBy({ email });
    if (existing)
      throw new ConflictException(
        `Customer with email ${email} already exists`,
      );
  }
}
