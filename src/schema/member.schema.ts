import { z } from 'zod';
import { ZodDecimalPositive } from './helpers/numeric.helper';
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
export class MemberValidation {
  private static readonly baseSchema = z.object({
    // username: z.string().min(1).max(50),
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

  static readonly CREATE = this.baseSchema.extend({
    voucherAmount: z.number(),
  });

  static readonly UPDATE = this.baseSchema.extend({
    id: z.number().positive(),
    voucherAmount: z.number(),
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

const MemberResponse = MemberValidation.UPDATE.extend({
  voucherAmount: ZodDecimalPositive(),
  username: z.string().min(1).max(50),
  User: UserValidation.REGISTER,
});

export type CreateMemberRequest = z.infer<typeof MemberValidation.CREATE>;
export type UpdateMemberRequest = z.infer<typeof MemberValidation.UPDATE>;
export type MemberResponse = z.infer<typeof MemberResponse>;
export type SearchMemberRequest = z.infer<typeof MemberValidation.SEARCH>;
