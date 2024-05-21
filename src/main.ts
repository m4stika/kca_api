import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // app.use(json({ limit: '5mb' }));
  app.use(cookieParser());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = new Logger();
  const envService = app.get(ConfigService);
  try {
    await app.listen(
      envService.get<number>('PORT')!,
      envService.get<string>('HOST')!,
    );
    logger.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    logger.error(error);
  }
}
bootstrap();
