import { z } from 'zod';
import { ZodDecimalPositive } from './helpers/numeric.helper';

export class SimpananValidation {
  private static readonly baseSchema = z.object({
    noAnggota: z.string(),
    namaAnggota: z.string().nullable(),
    totalPokok: ZodDecimalPositive(),
    totalWajib: ZodDecimalPositive(),
    sisaSukarela: ZodDecimalPositive(),
    totalSaldo: ZodDecimalPositive(),
  });

  static readonly CREATE = this.baseSchema;

  static readonly UPDATE = this.baseSchema;

  static readonly SEARCH = z.object({
    noAnggota: z.string().min(1).optional(),
    namaAnggota: z.string().min(1).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).positive(),
  });
}

const SimpananResponse = SimpananValidation.UPDATE;

export type CreateSimpananRequest = z.infer<typeof SimpananValidation.CREATE>;
export type UpdateSimpananRequest = z.infer<typeof SimpananValidation.UPDATE>;
export type SimpananResponse = z.infer<typeof SimpananResponse>;
export type SearchSimpananRequest = z.infer<typeof SimpananValidation.SEARCH>;
