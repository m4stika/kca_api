import { registerAs } from '@nestjs/config';
import { TEnvironment, levels } from 'src/schema/env.schema';
import { Environment } from './enum';

export default registerAs(
  'env',
  (): TEnvironment => ({
    DATABASE_URL: process.env.DATABASE_URL!,
    NODE_ENV: process.env.NODE_ENV as Environment,
    PORT: parseInt(process.env.PORT!),
    HOST: process.env.HOST!,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
    JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN!,
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN!,
    COOKIES_EXPIRED_DAY: parseInt(process.env.COOKIES_EXPIRED_DAY!),
    COOKIES_EXPIRED_TIME: parseInt(process.env.COOKIES_EXPIRED_TIME!),
    LOG_LEVEL: levels.find((item) => item === process.env.LOG_LEVEL!) || 'info',
    LOG_FILE_PATH: process.env.LOG_FILE_PATH!,
    MULTER_DESTINATION_PATH: process.env.MULTER_DESTINATION_PATH!,
    MULTER_FILE_SIZE_LIMIT: parseInt(process.env.MULTER_FILE_SIZE_LIMIT!),
    MULTER_FILES_LIMIT: parseInt(process.env.MULTER_FILES_LIMIT!),
  }),
);
