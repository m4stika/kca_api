import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'query' },
      ],
    });
  }

  async onModuleInit() {
    this.$on('info', (e) => {
      this.logger.info(`Prisma : ${e.message}`);
    });
    this.$on('warn', (e) => {
      this.logger.warn({ source: `Prisma Warning`, e });
    });
    this.$on('error', (e) => {
      this.logger.error({ source: `Prisma Error`, e });
    });
    this.$on('query', (e) => {
      const item = { query: e.query };
      if (e.params && e.params !== '[]')
        Object.assign(item, { params: e.params.replace(/\"|\\/g, '') });
      if (e.duration > 0) Object.assign(item, { duration: `${e.duration} ms` });
      e.params !== '[]' || e.duration > 0
        ? this.logger.debug(item)
        : this.logger.debug(`Prisma Query : `, e.query);
    });
    /* this.$queryRaw`SELECT 1+1`
      .then(() =>
        this.logger.info(
          'Database connection has been established successfully.',
        ),
      )
      .catch((err) =>
        this.logger.error(`Unable to connect to the database: ${err}`),
      ); */

    this.$connect()
      .then(() =>
        this.logger.info(
          'Database connection has been established successfully.',
        ),
      )
      .catch((err) =>
        this.logger.error(`Unable to connect to the database: ${err}`),
      );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
