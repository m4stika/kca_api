import { z } from 'zod';
import { AnggotaValidation } from './anggota.schema';
import { ZodDecimalPositive } from './helpers/numeric.helper';
import { ProductValidation } from './product.schema';

export class OrderValidation {
  private static readonly orderDetail = z.object({
    parentId: z.number(),
    index: z.number(),
    kodeBarang: z.string(),
    Barang: ProductValidation.UPDATE.optional(),
    price: ZodDecimalPositive().default(0),
    qty: z.number(),
  });

  private static readonly baseSchema = z.object({
    invoiceNo: z.string().nullish(),
    transactionType: z.string(),
    noAnggota: z.string(),
    Anggota: AnggotaValidation.UPDATE.nullish(),
    transactionDate: z.coerce.date(),
    orderStatus: z.string(),
    shippingMethod: z.string().nullish(),
    paymentMethod: z.string().nullish(),
    amount: ZodDecimalPositive().default(0),
    remark: z.string(),
    notes: z.string(),
    OrderDetail: z.array(this.orderDetail),
  });

  static readonly CREATE = this.baseSchema;
  static readonly DETAIL = this.orderDetail;

  static readonly UPDATE = this.baseSchema.extend({
    id: z.number(),
  });

  static readonly SEARCH = z.object({
    noAnggota: z.string().min(1).nullish(),
    noInvoice: z.string().min(1).nullish(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).positive(),
  });
}

const OrderResponse = OrderValidation.UPDATE;

export type CreateOrderRequest = z.infer<typeof OrderValidation.CREATE>;
export type UpdateOrderRequest = z.infer<typeof OrderValidation.UPDATE>;
export type OrderResponse = z.infer<typeof OrderResponse>;
export type OrderDetailResponse = z.infer<typeof OrderValidation.DETAIL>;
export type SearchOrderRequest = z.infer<typeof OrderValidation.SEARCH>;
