import * as z from 'zod';
import { ContractResponse } from './contract.schema';
import { Merge } from './helpers/merge.helper';

export class AmendmentValidation {
  static readonly CREATE = z.object({
    amendmentNo: z.string(),
    amendmentDate: z.coerce.date(),
    remark: z.string(),
    amendmentFileName: z.string(),
    // contractValue: z.string(),
    contractValidityPeriod: z.string(),
    amendmentValue: z.string(),
    validityPeriod: z.string(),
    // isActive: z.string(),
    contractId: z.string(),
  });
}

export type CreateAmendmentRequest = z.infer<typeof AmendmentValidation.CREATE>;
export type AmendmentResponse = Merge<
  z.infer<typeof AmendmentValidation.CREATE>,
  {
    id: string;
    Contract: ContractResponse;
  }
>;
