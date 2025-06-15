import { Test, TestingModule } from '@nestjs/testing';
import { SpecialOffersService } from './special-offers.service';
import { DatabaseService } from '../database/database.service';

describe('SpecialOffersService', () => {
  let service: SpecialOffersService;

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
      providers: [
        SpecialOffersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<SpecialOffersService>(SpecialOffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
