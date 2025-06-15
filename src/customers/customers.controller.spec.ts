import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { DatabaseService } from '../database/database.service';

describe('CustomersController', () => {
  let controller: CustomersController;

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
      controllers: [CustomersController],
      providers: [
        CustomersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
