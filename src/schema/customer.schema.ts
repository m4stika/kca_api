import { z } from 'zod';

/* export class CreateCustomerRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  npwp?: string;
}
export class CustomerResponse extends CreateCustomerRequest {
	id: string;
}
export class UpdateCustomerRequest extends CustomerResponse {}
export class SearchCustomerRequest {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  page!: number;
  size!: number;
}
*/

export class CustomerValidation {
  private static readonly baseSchema = z.object({
    name: z.string().min(1).max(100),
    address: z.string().min(1).max(100).nullish(),
    email: z.string().min(1).max(50).email().nullish(),
    phone: z.string().min(1).max(20).nullish(),
    npwp: z.string().min(1).max(50).nullish(),
  });

  static readonly CREATE = this.baseSchema;

  static readonly UPDATE = this.baseSchema.extend({
    id: z.string(),
  });

  static readonly SEARCH = z.object({
    name: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).positive(),
  });
}

export type CreateCustomerRequest = z.infer<typeof CustomerValidation.CREATE>;
export type UpdateCustomerRequest = z.infer<typeof CustomerValidation.UPDATE>;
export type CustomerResponse = z.infer<typeof CustomerValidation.UPDATE>;
export type SearchCustomerRequest = z.infer<typeof CustomerValidation.SEARCH>;
