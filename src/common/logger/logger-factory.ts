import { ConfigService } from '@nestjs/config';
import { WinstonModuleOptions } from 'nest-winston';
import { format, transports } from 'winston';
// const logLevel = process.env.LOG_LEVEL as string;

const customLevels = {
  levels: {
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  },
  colors: {
    trace: '\x1b[32m',
    debug: '\x1b[32m',
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    fatal: '\x1b[31m',
  },
};

function formatObject(param: string | object) {
  if (typeof param === 'object') {
    return JSON.stringify(param);
  }
  return param;
}

//Using the printf format.
const customFormat = format.printf(({ level, message, timestamp }) => {
  type levelType = keyof typeof customLevels.levels;
  const color = customLevels.colors[level as levelType];
  Object.entries(customLevels.colors).find(
    ([key, value]) => key === level,
  )?.[1] ?? '\x1b[39m';
  return `${color}${level.toUpperCase()}${'\x1b[39m'} [${timestamp}]: ${
    (level as levelType) === 'error' ? '\x1b[33m' : color
  }${formatObject(message)}`;
});

export const LoggerFactory = (config: ConfigService): WinstonModuleOptions => ({
  transports: [
    new transports.Console({
      stderrLevels: Object.keys(customLevels.levels),
      level: config.get('LOG_LEVEL') || 'info',
      format: format.combine(
        format.label({ label: 'kda' }),
        format.timestamp({ format: 'DD-MMM HH:mm:ss' }),
        customFormat,
      ),
    }),
  ],
});

/*
export const LoggerFactory = () => {
  const consoleFormat = format.combine(
    format.label({ label: 'kda' }),
    format.timestamp({ format: 'DD-MMM HH:mm:ss' }),
    customFormat,
    nestWinstonModuleUtilities.format.nestLike('Kda', {
      colors: true,
      prettyPrint: true,
    }),
  );

  return WinstonModule.createLogger({
    level: logLevel,
    levels: customLevels.levels,
    transports: [
      new transports.Console({
        format: consoleFormat,
      }),
    ],
  });
};
 */
