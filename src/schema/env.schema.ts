import LoggerLevel from 'src/common/logger/logger-levels';
import { Environment } from 'src/config/enum';
import objectHelper from 'src/helper/object-helper';
import { z } from 'zod';

export const levels = objectHelper.getKeyFromObject(LoggerLevel.levels);

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.nativeEnum(Environment).default(Environment.Development),
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default('localhost'),
  JWT_SECRET_KEY: z.string().default('kda-8000'),
  JWT_ACCESS_TOKEN: z.string().default('1h'), //default 1hour
  JWT_REFRESH_TOKEN: z.string().default('1d'), //default 1day
  COOKIES_EXPIRED_DAY: z.coerce.number().default(1), //default 1day
  COOKIES_EXPIRED_TIME: z.coerce.number().default(1), //default 1hour
  LOG_LEVEL: z.enum(levels).default('info'),
  LOG_FILE_PATH: z.string().default('logs'),
  MULTER_DESTINATION_PATH: z.string().default('./upload-files'),
  MULTER_FILE_SIZE_LIMIT: z.coerce.number().default(2 * 1024 * 1024), //default 2mb
  MULTER_FILES_LIMIT: z.coerce.number().default(1),
});
export type TEnvironment = z.infer<typeof envSchema>;
