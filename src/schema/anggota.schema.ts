import { z } from 'zod';
import { ZodDecimalPositive } from './helpers/numeric.helper';
import { UserValidation } from './user.schema';

export class AnggotaValidation {
  private static readonly baseSchema = z.object({
    noAnggota: z.string().min(1).max(30),
    nip: z.string().nullish(),
    namaunit: z.string().nullish(),
    namasub: z.string().nullish(),
    keterangan: z.string().nullish(),
    namaAnggota: z.string().nullish(),
    alamat: z.string().nullish(),
    telp: z.string().nullish(),
    kelamin: z.string().nullish(),
    kodebank: z.string().nullish(),
    cabang: z.string().nullish(),
    norek: z.string().nullish(),
    namarek: z.string().nullish(),
    // saldoVoucher: ZodDecimalPositive().optional().default(0),
  });

  static readonly CREATE = this.baseSchema.extend({
    saldoVoucher: z.number(),
  });

  static readonly UPDATE = this.baseSchema.extend({
    // id: z.number().positive(),
    saldoVoucher: z.number(),
  });

  static readonly SEARCH = z.object({
    noAnggota: z.string().min(1).optional(),
    namaAnggota: z.string().min(1).optional(),
    alamat: z.string().min(1).optional(),
    // email: z.string().min(1).optional(),
    telp: z.string().min(1).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).positive(),
  });
}

const AnggotaResponse = AnggotaValidation.UPDATE.extend({
  saldoVoucher: ZodDecimalPositive(),
  // username: z.string().min(1).max(50),
  User: UserValidation.REGISTER,
});

export type CreateAnggotaRequest = z.infer<typeof AnggotaValidation.CREATE>;
export type UpdateAnggotaRequest = z.infer<typeof AnggotaValidation.UPDATE>;
export type AnggotaResponse = z.infer<typeof AnggotaResponse>;
export type SearchAnggotaRequest = z.infer<typeof AnggotaValidation.SEARCH>;
