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
    verificationStatus: z.string().default("ON_VERIFICATION")
  });

  private static readonly baseRincianSchema = z.object({
    refCode: z.string(),
    angKe: z.number(),
    bulan: z.number(),
    tahun: z.number(),
    rpPinjaman: ZodDecimalPositive(),
    rpBunga: ZodDecimalPositive(),
    rpBayar: ZodDecimalPositive(),
    blnLunas: z.number().nullish(),
    thnLunas: z.number().nullish(),
    tglLunas: z.coerce.date().nullish(),
    lunas: z.string().max(1).default("N"),
    keterangan: z.string().nullish()
  })

  static readonly CREATE = this.baseSchema.extend({
    RincianPinjaman: z.array(this.baseRincianSchema).optional()
  });

  static readonly UPDATE = this.baseSchema;

  static readonly SEARCH = z.object({
    noAnggota: z.string().min(1).optional(),
    namaAnggota: z.string().min(1).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).positive(),
  });

  static readonly CREATEDETAIL = this.baseRincianSchema
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
export type PinjamanDetail = z.infer<typeof PinjamanValidation.CREATEDETAIL>;
