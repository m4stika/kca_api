import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';
import { Merge } from './helpers/merge.helper';
import { ZodDecimalPositive } from './helpers/numeric.helper';
import { MemberResponse } from './member.schema';

export class SavingAccountValidation {
  private static readonly baseSchema = z.object({
    // id: z.string(),
    memberId: z.number().positive(),
    register_date: z.coerce.date(),
    principalDeposit: ZodDecimalPositive(),
    mandatoryDeposit: ZodDecimalPositive(),
    voluntaryDeposit: ZodDecimalPositive().optional(),
    otherDeposit: ZodDecimalPositive().optional(),
    // savingAmount: ZodDecimalPositive().optional(),
    voluntaryWithdrawalLimit: ZodDecimalPositive(),
    otherWithdrawalLimit: ZodDecimalPositive(),
    // withdrawalLimit: ZodDecimalPositive(),
  });

  static readonly CREATE = this.baseSchema;

  static readonly UPDATE = this.baseSchema.extend({
    id: z.number().positive(),
  });
}

export type CreateSavingAccountRequest = z.infer<
  typeof SavingAccountValidation.CREATE
>;

export type UpdateSavingAccountRequest = Merge<
  CreateSavingAccountRequest,
  { id: number }
>;

export type SavingAccountResponse = Merge<
  CreateSavingAccountRequest,
  {
    id: number;
    savingAmount: Decimal;
    withdrawalLimit: Decimal;
    Member: MemberResponse;
  }
>;
