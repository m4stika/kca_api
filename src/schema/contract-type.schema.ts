import { z } from 'zod';
import { Merge } from './helpers/merge.helper';

export class ContractTypeValidation {
  private static readonly baseSchema = z.object({
    name: z.string().min(1).max(100),
    revenueId: z.string().min(1).max(10),
    collectionReceivablesId: z.string().min(1).max(10),
    assignmentReceivablesId: z.string().min(1).max(10),
  });

  static readonly CREATE = this.baseSchema;

  static readonly UPDATE = this.baseSchema.extend({
    id: z.string().cuid(),
  });
}

export type CreateContractTypeRequest = z.infer<
  typeof ContractTypeValidation.CREATE
>;

export type UpdateContractTypeRequest = Merge<
  CreateContractTypeRequest,
  { id: string }
>;

export type ContractTypeResponse = Merge<
  CreateContractTypeRequest,
  { id: string }
>;
