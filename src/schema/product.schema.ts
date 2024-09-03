import { z } from 'zod';
import { ZodDecimalPositive } from './helpers/numeric.helper';

export class ProductValidation {
  private static readonly baseSchema = z.object({
    kodeBarang: z.string().min(1).max(5),
    barcode: z.string().nullish(),
    namaJenis: z.string(),
    namaBarang: z.string(),
    satuan: z.string(),
    stok: ZodDecimalPositive(),
    hargaJual: ZodDecimalPositive(),
    fileName: z.string()
  });

  static readonly CREATE = this.baseSchema;

  static readonly UPDATE = this.baseSchema;

  static readonly SEARCH = z.object({
    page: z.number().min(1).positive(),
    size: z.number().min(1).positive(),
    searchValue: z.string().min(1).optional(),
    filter: z.string().optional(),
    orderBy: z
      .object({
        id: z.string().min(1),
        sort: z.enum(["asc", "desc"])
      })
      .optional(),
  });
}

const ProductResponse = ProductValidation.UPDATE;

export type CreateProductRequest = z.infer<typeof ProductValidation.CREATE>;
export type UpdateProductRequest = z.infer<typeof ProductValidation.UPDATE>;
export type ProductResponse = z.infer<typeof ProductResponse>;
export type SearchProductRequest = z.infer<typeof ProductValidation.SEARCH>;
