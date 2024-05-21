import { BadGatewayException, Injectable } from '@nestjs/common';
import { TEnvironment, envSchema } from 'src/schema/env.schema';

@Injectable()
export class EnvService {
  private readonly envConfig: TEnvironment;
  constructor() {
    this.envConfig = envSchema.parse(process.env);
  }

  get = (key: keyof TEnvironment) => {
    if (!this.envConfig) return undefined;
    const value = this.envConfig[key];
    if (value === undefined) {
      throw new BadGatewayException(`Missing environment variable: ${key}`);
    }
    return value;
  };
  isDev = (): boolean => this.get('NODE_ENV') === 'development';
  isProd = (): boolean => this.get('NODE_ENV') === 'production';

  PORT = (): number => this.envConfig.PORT;
  HOST = (): string => this.envConfig.HOST;

  COOKIES_EXPIRED_DAY = (): number => this.get('COOKIES_EXPIRED_DAY') as number;
  COOKIES_EXPIRED_TIME = (): number =>
    this.get('COOKIES_EXPIRED_TIME') as number;

  LOG_LEVEL = (): string => this.get('LOG_LEVEL') as string;
}
