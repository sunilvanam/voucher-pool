import { Test, TestingModule } from '@nestjs/testing';
import { SpecialOffersController } from './special-offers.controller';
import { SpecialOffersService } from './special-offers.service';
import { DatabaseService } from '../database/database.service';

describe('SpecialOffersController', () => {
  let controller: SpecialOffersController;

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
      controllers: [SpecialOffersController],
      providers: [
        SpecialOffersService,
        // Provide the mock instead of importing the entire DatabaseModule
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<SpecialOffersController>(SpecialOffersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add some actual tests for your controller
});
