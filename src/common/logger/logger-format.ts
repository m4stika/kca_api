import { format } from 'winston';
import {
  ConsoleTransportOptions,
  FileTransportOptions,
} from 'winston/lib/winston/transports';
import LoggerLevel from './logger-levels';

const formatOptions: {
  file: FileTransportOptions;
  console: ConsoleTransportOptions;
} = {
  file: {
    filename: `${process.env.LOG_FILE_PATH || 'logs'}/error.log`,
    maxsize: 5242880, //5MB
    level: 'error',
    format: format.combine(
      // format.colorize({ all: false }),
      // format.splat(),
      format.timestamp({ format: 'DD-MMM HH:mm:ss' }), // Format tanggal
      format.printf((info) => `${info.timestamp} - ${info.message}`),
    ),
  },
  console: {
    format: format.combine(
      format.colorize({
        level: true,
        message: true,
        colors: LoggerLevel.colors,
      }), // Aktifkan pewarnaan
      format.timestamp({ format: 'DD-MMM HH:mm:ss' }), // Format tanggal
      format.printf(
        (info) => `${info.level} ${info.timestamp} ${info.message}`,
      ),
    ),
  },
};

export default formatOptions;
