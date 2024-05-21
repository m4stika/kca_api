import { z } from 'zod';
import { UserValidation } from './user.schema';
/*
export class CreateContactRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class ContactResponse extends CreateContactRequest {
  id: number;
}

export class UpdateContactRequest extends ContactResponse {}

export class SearchContactRequest {
  name?: string;
  email?: string;
  phone?: string;
  page: number;
  size: number;
}
 */
export class ContactValidation {
  private static readonly baseSchema = z.object({
    username: z.string().min(1).max(50),
    memberId: z.string().min(1).max(30),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100).nullish(),
    email: z.string().min(1).max(50).email().nullish(),
    phone: z.string().min(1).max(20).nullish(),
    NIP: z.string().min(1).max(30).nullish(),
    memberTypeId: z.number().positive().nullish(),
    unitId: z.number().positive().nullish(),
    subUnitId: z.number().positive().nullish(),
  });

  static readonly CREATE = this.baseSchema;

  static readonly UPDATE = this.baseSchema.extend({
    id: z.number().positive(),
  });

  static readonly SEARCH = z.object({
    memberId: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).positive(),
  });
}

const contactResponse = ContactValidation.UPDATE.extend({
  User: UserValidation.REGISTER,
});

export type CreateContactRequest = z.infer<typeof ContactValidation.CREATE>;
export type UpdateContactRequest = z.infer<typeof ContactValidation.UPDATE>;
export type ContactResponse = z.infer<typeof contactResponse>;
export type SearchContactRequest = z.infer<typeof ContactValidation.SEARCH>;
