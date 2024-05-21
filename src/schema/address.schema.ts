import { z } from 'zod';

/* export class CreateAddressRequest {
  contactId: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode: string;
}

export class AddressResponse extends CreateAddressRequest {
  id: number;
}
export class UpdateAddressRequest extends CreateAddressRequest {
  id: number;
}

export class GetAddressRequest {
  contactId: number;
  addressId: number;
}

export class RemoveAddressRequest extends GetAddressRequest {}
*/

export class AddressValidation {
  private static readonly baseSchema = z.object({
    contactId: z.number().min(1).positive(),
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(50).nullish(),
    province: z.string().min(1).max(50).nullish(),
    country: z.string().min(1).max(50),
    postalCode: z.string().min(1).max(10),
  });

  static readonly CREATE = this.baseSchema;

  static readonly GET = z.object({
    contactId: z.number().min(1).positive(),
    addressId: z.number().min(1).positive(),
  });

  static readonly UPDATE = this.baseSchema.extend({
    id: z.number().min(1).positive(),
  });

  static readonly REMOVE = z.object({
    contactId: z.number().min(1).positive(),
    addressId: z.number().min(1).positive(),
  });
}

export type CreateAddressRequest = z.infer<typeof AddressValidation.CREATE>;
export type UpdateAddressRequest = z.infer<typeof AddressValidation.UPDATE>;
export type AddressResponse = z.infer<typeof AddressValidation.UPDATE>;
export type GetAddressRequest = z.infer<typeof AddressValidation.GET>;
export type RemoveAddressRequest = z.infer<typeof AddressValidation.GET>;
