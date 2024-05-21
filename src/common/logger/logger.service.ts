import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from 'nest-winston';
import environmentConfig from 'src/config/environment.config';
import { transports } from 'winston';
import formatOptions from './logger-format';
import LoggerLevel from './logger-levels';

@Injectable()
export class LoggerService implements WinstonModuleOptionsFactory {
  constructor(
    @Inject(environmentConfig.KEY)
    private readonly configService: ConfigType<typeof environmentConfig>,
  ) {}
  createWinstonModuleOptions(): WinstonModuleOptions {
    return {
      levels: LoggerLevel.levels,
      level: this.configService.LOG_LEVEL,
      transports: [
        new transports.Console(formatOptions.console),
        new transports.File(formatOptions.file),
      ],
    };
  }
}
