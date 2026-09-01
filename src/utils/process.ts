import { spawn } from 'child_process';
import { logger } from './logger';

export interface RunCommandOptions {
  cwd?: string;
  silent?: boolean;
}

export function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions = {}
): Promise<void> {
  const { cwd, silent = false } = options;

  return new Promise((resolve, reject) => {
    logger.debug(`Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      shell: process.platform === 'win32',
    });

    let stderr = '';

    if (silent && child.stderr) {
      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    }

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `Command failed with exit code ${code}`));
      }
    });
  });
}

export function commandExists(command: string): Promise<boolean> {
  const check = process.platform === 'win32' ? 'where' : 'which';

  return new Promise((resolve) => {
    const child = spawn(check, [command], { shell: true, stdio: 'pipe' });

    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}
