import { Decimal } from '@prisma/client/runtime/library';
import * as z from 'zod';
import { UpdateContractTypeRequest } from './contract-type.schema';
import { CustomerResponse } from './customer.schema';
import { Merge } from './helpers/merge.helper';
import { ZodDecimalPositive } from './helpers/numeric.helper';

export class ContractValidation {
  private static readonly baseSchema = z.object({
    contractNo: z.string().min(1).max(100),
    description: z.string().min(1),
    contractValue: ZodDecimalPositive(),
    includePPN: z.boolean().default(true),
    percentPPN: z.number().positive().default(11),
    contractDate: z.coerce.date(),
    validityPeriod: z.coerce.date(),
    customerId: z.string().min(1),
    contractTypeId: z.string().cuid(),
  });

  static readonly CREATE = this.baseSchema;

  static readonly UPDATE = this.baseSchema.extend({
    id: z.string().cuid(),
  });

  static readonly SUBMIT = z.array(z.string().cuid());

  static readonly SEARCH = z.object({
    contractNo: z.string().min(1).optional(),
    customer: z.string().min(1).optional(),
    contractDate: z.coerce.date().optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).positive(),
  });
}

type Response = {
  id: string;
  // contractStatus: VerificationStatus;
  // verificationLevel: VerificationLevel;
  accumulatedPayment: Decimal;
  rejectedRemark?: string | null;
  bastAmount: Decimal;
  billedAmount: Decimal;
  paidAmount: Decimal;
  balanceAmount: Decimal;
  oldContractValue: Decimal;
  oldValidityPeriod?: Date | null;
  Customer: CustomerResponse;
  ContractType?: UpdateContractTypeRequest;
};

export type CreateContractRequest = z.infer<typeof ContractValidation.CREATE>;
export type ContractResponse = Merge<CreateContractRequest, Response>;
export type ContractSummaryResponse = {
  contractDate: Date;
  amount: Decimal | null;
};
export type UpdateContractRequest = z.infer<typeof ContractValidation.UPDATE>;
export type SearchContractRequest = z.infer<typeof ContractValidation.SEARCH>;
