import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import {
  GenerateVouchersDto,
  ValidateVoucherDto,
  ValidateVoucherResponseDto,
  VoucherResponseDto,
} from './dto/voucher.dto';
import { Voucher } from './entities/voucher.entity';
import { Repository, In, IsNull } from 'typeorm';
import { DatabaseService } from '../database/database.service';
import { SpecialOffersService } from '../special-offers/special-offers.service';
import { CustomersService } from '../customers/customers.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VouchersService {
  private vouchersRepository: Repository<Voucher>;
  constructor(
    private readonly db: DatabaseService,
    private readonly specialOffersService: SpecialOffersService,
    private readonly customersService: CustomersService,
  ) {
    this.vouchersRepository = this.db.getRepository(Voucher);
  }

  /**
   * Generates voucher codes for customers based on a special offer.
   *
   * @param input - The input data for generating vouchers containing specialOfferId and expirationDate
   * @throws {BadRequestException} When:
   *  - Special offer is not found
   *  - Expiration date is not in the future
   *  - No customers are found in the system
   *  - No new vouchers can be generated (all customers already have vouchers)
   * @throws {HttpException} When there's an error during the voucher generation process
   * @returns A string message indicating the number of vouchers successfully generated
   */
  async generateVoucherCode(input: GenerateVouchersDto): Promise<string> {
    // Check special offer existence and validity
    const specialOffer = await this.specialOffersService.findOne(
      Number(input.specialOfferId),
    );

    if (!specialOffer) throw new BadRequestException('Special offer not found');

    // Check if the effective date is in the future
    if (new Date(input.expirationDate) <= new Date())
      throw new BadRequestException('Expiration date must be in the future');

    // Check if there are customers to generate vouchers
    const customers = await this.customersService.findAll();
    if (customers.length === 0)
      throw new BadRequestException('No customers found to generate vouchers');

    try {
      // Get existing vouchers in one query
      const existingVouchers = await this.vouchersRepository.find({
        select: ['customerId'],
        where: {
          customerId: In(customers.map((c) => c.id)),
          specialOfferId: Number(specialOffer.id),
        },
      });

      // Track which customers already have vouchers - Set provides O(1) lookups
      const customersWithVouchers = new Set(
        existingVouchers.map((v) => v.customerId),
      );

      // Create vouchers for customers who don't have one yet
      const newVouchers: Voucher[] = [];
      for (const customer of customers) {
        if (!customersWithVouchers.has(customer.id)) {
          // Generate unique code for each customer
          const code = this.generateUniqueCode();
          const voucher = this.vouchersRepository.create({
            code,
            expirationDate: new Date(input.expirationDate),
            specialOfferId: specialOffer.id,
            customerId: customer.id,
          });
          newVouchers.push(voucher);
        }
      }

      if (newVouchers.length === 0)
        throw new BadRequestException('No new vouchers to generate');

      // Save all new vouchers in a transaction
      await this.db.withTransaction(async (manager) => {
        const voucherRepository = manager.getRepository(Voucher);
        await voucherRepository.save(newVouchers);
      });

      return `Generated ${newVouchers.length} vouchers successfully`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new HttpException(
        'Error generating vouchers: ' + errorMessage,
        500,
      );
    }
  }

  /**
   * Validates and optionally redeems a voucher for a customer.
   *
   * This method performs the following checks:
   * - Verifies if the customer exists
   * - Checks if the voucher exists and belongs to the customer
   * - Validates if the voucher has already been used
   * - Ensures the voucher hasn't expired
   *
   * If shouldRedeem is true, the voucher will be redeemed in a transaction to prevent race conditions.
   *
   * @param input - The validation input containing customer email and voucher code
   * @param shouldRedeem - Optional flag to indicate if the voucher should be redeemed (defaults to false)
   *
   * @returns Promise<ValidateVoucherResponseDto> - Returns an object containing:
   *  - success: boolean indicating if the operation was successful
   *  - message: descriptive message about the result
   *  - discountPercentage?: number (included only for valid vouchers)
   *
   * @throws HttpException
   *  - With status 500 if there's an error processing the voucher
   */
  async validateAndRedeemVoucher(
    input: ValidateVoucherDto,
    shouldRedeem = false,
  ): Promise<ValidateVoucherResponseDto> {
    const { code, email } = input;

    try {
      // Find the customer by email
      const customer = await this.customersService.findByEmail(email);
      if (!customer) {
        return {
          success: false,
          message: 'Customer not found with the provided email',
        };
      }

      // For validation only (outside transaction), first check if voucher exists
      const voucher = await this.vouchersRepository.findOne({
        where: {
          code,
          customerId: customer.id,
        },
        relations: ['specialOffer'],
      });

      if (!voucher) {
        return {
          success: false,
          message: 'Voucher not found or does not belong to this customer',
        };
      }

      // Check if voucher is already used
      if (voucher.usedAt) {
        return {
          success: false,
          message: 'Voucher has already been used',
        };
      }

      // Check if voucher is expired
      if (new Date() > voucher.expirationDate) {
        return {
          success: false,
          message: 'Voucher has expired',
        };
      }

      // If only validating (not redeeming), return success
      if (!shouldRedeem) {
        return {
          success: true,
          discountPercentage: voucher.specialOffer.discountPercentage,
          message: 'Voucher is valid and can be redeemed',
        };
      }

      // Redeem the voucher in a transaction
      return await this.db.withTransaction(async (manager) => {
        const voucherRepository = manager.getRepository(Voucher);

        // Find the voucher again within the transaction to prevent race conditions
        const freshVoucher = await voucherRepository.findOne({
          where: {
            code,
            customerId: customer.id,
            usedAt: IsNull(),
          },
          relations: ['specialOffer'],
        });

        // Double-check that the voucher is still valid
        if (!freshVoucher) {
          return {
            success: false,
            message: 'Voucher not found or has already been redeemed',
          };
        }

        if (new Date() > freshVoucher.expirationDate) {
          return {
            success: false,
            message: 'Voucher has expired',
          };
        }

        // Mark the voucher as used
        freshVoucher.usedAt = new Date();
        await voucherRepository.save(freshVoucher);

        // Return success response
        return {
          success: true,
          discountPercentage: freshVoucher.specialOffer.discountPercentage,
          message: 'Voucher successfully redeemed',
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      throw new HttpException('Error processing voucher: ' + errorMessage, 500);
    }
  }

  /**
   * Generates a unique voucher code with a specific format.
   * The code consists of a 'VP' prefix followed by 8 uppercase alphanumeric characters.
   *
   * @returns A string in the format 'VP' + 6 random uppercase characters
   * @example
   * // Returns something like: "VP1A2B3C4D"
   * generateUniqueCode();
   */
  private generateUniqueCode(): string {
    const prefix = 'VP';
    const uniquePart = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
    return `${prefix}${uniquePart}`;
  }

  /**
   * Retrieves all unused and non-expired vouchers for a customer identified by email.
   *
   * @param email - The email address of the customer
   * @returns A promise that resolves to an array of VoucherResponseDto objects containing:
   *  - code: The voucher code
   *  - specialOfferName: Name of the associated special offer
   *  - discountPercentage: Percentage discount offered by the voucher
   *  - expirationDate: Date when the voucher expires
   *  - isValid: Boolean indicating if voucher is unused and not expired
   * @throws Error if customer with given email is not found
   */
  async getCustomerVouchers(email: string): Promise<VoucherResponseDto[]> {
    const customer = await this.customersService.findByEmail(email);

    const vouchers = await this.vouchersRepository.find({
      where: {
        customerId: customer.id,
        usedAt: IsNull(),
      },
      relations: ['specialOffer'],
      order: { expirationDate: 'ASC' },
    });

    return vouchers
      .filter((voucher) => new Date(voucher.expirationDate) > new Date())
      .map((voucher) => ({
        code: voucher.code,
        specialOfferName: voucher.specialOffer.name,
        discountPercentage: voucher.specialOffer.discountPercentage,
        expirationDate: voucher.expirationDate,
        isValid:
          voucher.usedAt === null &&
          new Date(voucher.expirationDate) > new Date(),
      }));
  }

  findAll() {
    return this.vouchersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.vouchersRepository.findOne({
      where: { id: Number(id) },
      relations: ['specialOffer', 'customer'],
    });
  }

  remove(id: number) {
    return this.vouchersRepository.delete(id).then((res) => {
      if (res && res.affected && res.affected > 0) return true;
      return false;
    });
  }
}
