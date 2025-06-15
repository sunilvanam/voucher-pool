import { Customer } from '../../customers/entities/customer.entity';
import { SpecialOffer } from '../../special-offers/entities/special-offer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vouchers')
@Index(['customerId', 'specialOfferId'])
export class Voucher {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'code',
    unique: true,
  })
  @Index('idx_voucher_code')
  code: string;

  @Column({
    type: 'timestamp',
    name: 'expiration_date',
  })
  expirationDate: Date;

  @Column({
    name: 'special_offer_id',
  })
  specialOfferId: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => SpecialOffer, (specialOffer) => specialOffer.voucherCodes)
  @JoinColumn({ name: 'special_offer_id' })
  specialOffer: SpecialOffer;

  @ManyToOne(() => Customer, (customer) => customer.voucherCodes)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'timestamp', nullable: true, name: 'used_at' })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
