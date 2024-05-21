import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from 'src/auth/auth.module';
import environmentConfig from 'src/config/environment.config';
import { envSchema } from 'src/schema/env.schema';
import { AuthMiddleware } from './auth.middleware';
import { ErrorFilter } from './error.filter';
import { LoggerService } from './logger/logger.service';
import { MulterConfigService } from './multer.service';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';

@Global()
@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_TOKEN,
      },
    }),
    ConfigModule.forRoot({
      validate: (envFile) => envSchema.parse(envFile),
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
      load: [environmentConfig],
    }),
    WinstonModule.forRootAsync({
      useClass: LoggerService,
      inject: [ConfigService],
    }),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
      inject: [ConfigService],
    }),
  ],
  providers: [
    ValidationService,
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
  exports: [ValidationService, PrismaService, MulterModule],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: 'register', method: RequestMethod.ALL })
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}
