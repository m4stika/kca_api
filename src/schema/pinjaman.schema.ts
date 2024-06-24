import { z } from 'zod';
import { ZodDecimalPositive } from './helpers/numeric.helper';

export class PinjamanValidation {
  private static readonly baseSchema = z.object({
    refCode: z.string(),
    noAnggota: z.string(),
    tglPinjam: z.coerce.date(),
    isPinjamanUang: z.boolean().default(true),
    bulan: z.number(),
    tahun: z.number(),
    nilaiPinjaman: ZodDecimalPositive(),
    jangkaWaktu: z.number(),
    jenisBunga: z.string(),
    persenBunga: ZodDecimalPositive(),
    biayaAdmin: ZodDecimalPositive(),
    lunas: z.string().max(1).default('N'),
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

const PinjamanResponse = PinjamanValidation.UPDATE.extend({
  tanggalLunas: z.coerce.date().nullable(),
  terbayar: ZodDecimalPositive(),
  sisa: ZodDecimalPositive(),
});

export type CreatePinjamanRequest = z.infer<typeof PinjamanValidation.CREATE>;
export type UpdatePinjamanRequest = z.infer<typeof PinjamanValidation.UPDATE>;
export type PinjamanResponse = z.infer<typeof PinjamanResponse>;
export type SearchPinjamanRequest = z.infer<typeof PinjamanValidation.SEARCH>;
