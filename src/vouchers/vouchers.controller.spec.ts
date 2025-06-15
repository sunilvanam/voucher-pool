import { Test, TestingModule } from '@nestjs/testing';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { DatabaseService } from '../database/database.service';
import { SpecialOffersService } from '../special-offers/special-offers.service';
import { CustomersService } from '../customers/customers.service';

describe('VouchersController', () => {
  let controller: VouchersController;

  beforeEach(async () => {
    // Create a mock DatabaseService
    const mockDatabaseService = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
      withTransaction: jest.fn(
        async <T>(
          cb: (queryRunner: { getRepository: jest.Mock }) => Promise<T>,
        ): Promise<T> => await cb({ getRepository: jest.fn() }),
      ),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VouchersController],
      providers: [
        VouchersService,
        SpecialOffersService,
        CustomersService,
        // Provide the mock instead of importing the entire DatabaseModule
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<VouchersController>(VouchersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
