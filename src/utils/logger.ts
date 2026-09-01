import chalk from 'chalk';
import type { LogLevel } from '../types';

const prefix: Record<LogLevel, string> = {
  info: chalk.blue('ℹ'),
  success: chalk.green('✔'),
  warn: chalk.yellow('⚠'),
  error: chalk.red('✖'),
  debug: chalk.gray('●'),
};

function log(level: LogLevel, message: string): void {
  console.log(`${prefix[level]} ${message}`);
}

export const logger = {
  info: (message: string) => log('info', message),
  success: (message: string) => log('success', message),
  warn: (message: string) => log('warn', message),
  error: (message: string) => log('error', message),
  debug: (message: string) => {
    if (process.env.FLOOM_DEBUG) {
      log('debug', message);
    }
  },
};
