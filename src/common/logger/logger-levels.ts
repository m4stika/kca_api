// src/common/logger/custom-levels.ts

// Definisikan custom levels beserta warna dan nilai numeriknya
/*
ansiColors: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
  },
*/

const LoggerLevel = {
  levels: {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warn: 4,
    notice: 5,
    info: 6,
    debug: 7,
  },
  colors: {
    emerg: 'red', //red
    alert: 'red', //red
    crit: 'red', //red
    error: 'bold red', //red
    warn: 'italic yellow', //yellow
    notice: 'cyan', //cyan
    info: 'dim cyan', //cyan
    debug: 'italic gray', //green
  },
};
export default LoggerLevel;
