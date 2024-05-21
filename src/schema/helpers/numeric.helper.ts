import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

export const ZodDecimal = () =>
  z.coerce
    .number()
    .transform((value) => new Decimal(value))
    .default(0);

export const ZodDecimalPositive = () =>
  z.coerce
    .number()
    .positive()
    .transform((value) => new Decimal(value));

export const ZodDecimalNonNegative = () =>
  z.coerce
    .number()
    .nonnegative()
    .transform((value) => new Decimal(value))
    .default(0);
