import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SpecialOffer } from './entities/special-offer.entity';
import { CreateSpecialOfferDto } from './dto/create-special-offer.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SpecialOffersService {
  private specialOfferRepository: Repository<SpecialOffer>;
  constructor(private readonly db: DatabaseService) {
    this.specialOfferRepository = this.db.getRepository(SpecialOffer);
  }

  async createOrUpdate(
    input: CreateSpecialOfferDto,
    id?: number,
  ): Promise<SpecialOffer> {
    let specialOffer;

    if (id) {
      // Update: find and merge
      specialOffer = await this.specialOfferRepository.findOne({
        where: { id },
      });
      if (!specialOffer) {
        throw new NotFoundException(`Special Offer with ID ${id} not found`);
      }
      Object.assign(specialOffer, input);
    } else {
      // Create
      specialOffer = this.specialOfferRepository.create(input);
    }

    return this.specialOfferRepository.save(
      specialOffer,
    ) as Promise<SpecialOffer>;
  }

  async findAll(): Promise<SpecialOffer[]> {
    return this.specialOfferRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SpecialOffer> {
    const specialOffer = await this.specialOfferRepository.findOne({
      where: { id: Number(id) },
    });

    if (!specialOffer) {
      throw new NotFoundException(`Special Offer with ID ${id} not found`);
    }

    return specialOffer;
  }

  async remove(id: number): Promise<boolean> {
    const specialOffer = await this.specialOfferRepository.findOne({
      where: { id: Number(id) },
    });

    if (!specialOffer) {
      throw new NotFoundException(`Special Offer with ID ${id} not found`);
    }

    const res = await this.specialOfferRepository.delete(id);
    return res && res.affected && res.affected > 0 ? true : false;
  }
}
