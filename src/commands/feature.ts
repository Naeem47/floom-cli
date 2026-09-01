import { Command } from 'commander';
import type { FeatureOptions } from '../types';
import { generateModule } from '../generators/schematics';
import { logger } from '../utils/logger';

export function registerFeatureCommand(program: Command): void {
  program
    .command('feature')
    .description('Generate a new feature module (alias for: floom g module)')
    .argument('<name>', 'Feature name (e.g. auth, user_profile)')
    .option('-p, --project <dir>', 'Project directory', process.cwd())
    .option('--no-tests', 'Skip generating test files')
    .action(async (name: string, options) => {
      const featureOptions: FeatureOptions = {
        name,
        projectDir: options.project,
        withTests: options.tests,
      };

      try {
        await generateModule(featureOptions);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(message);
        process.exit(1);
      }
    });
}
