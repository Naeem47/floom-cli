import { Command } from 'commander';
import {
  generateCubit,
  generateModule,
  generatePage,
  generateProvider,
  generateRepository,
  generateService,
} from '../generators/schematics';
import { logger } from '../utils/logger';

function projectOption(cmd: Command): Command {
  return cmd.option('-p, --project <dir>', 'Project directory', process.cwd());
}

function featureOption(cmd: Command): Command {
  return cmd.option(
    '-f, --feature <name>',
    'Parent feature module (defaults to name)'
  );
}

function handleError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message);
  process.exit(1);
}

export function registerGenerateCommand(program: Command): void {
  const generate = program
    .command('generate')
    .alias('g')
    .description('Generate modules and components (NestJS-style schematics)');

  projectOption(
    generate
      .command('module <name>')
      .alias('mo')
      .description('Generate a full feature module (domain, data, presentation)')
      .option('--no-tests', 'Skip test files')
      .action(async (name: string, options) => {
        try {
          await generateModule({
            name,
            projectDir: options.project,
            withTests: options.tests,
          });
        } catch (error) {
          handleError(error);
        }
      })
  );

  projectOption(
    featureOption(
      generate
        .command('repository <name>')
        .alias('repo')
        .description('Generate repository interface + implementation with API call')
        .action(async (name: string, options) => {
          try {
            await generateRepository({
              name,
              projectDir: options.project,
              feature: options.feature,
            });
          } catch (error) {
            handleError(error);
          }
        })
    )
  );

  projectOption(
    featureOption(
      generate
        .command('page <name>')
        .alias('pg')
        .description('Generate a presentation page / view')
        .action(async (name: string, options) => {
          try {
            await generatePage({
              name,
              projectDir: options.project,
              feature: options.feature,
            });
          } catch (error) {
            handleError(error);
          }
        })
    )
  );

  projectOption(
    featureOption(
      generate
        .command('provider <name>')
        .alias('pr')
        .description('Generate a state provider (Riverpod or ChangeNotifier)')
        .action(async (name: string, options) => {
          try {
            await generateProvider({
              name,
              projectDir: options.project,
              feature: options.feature,
            });
          } catch (error) {
            handleError(error);
          }
        })
    )
  );

  projectOption(
    featureOption(
      generate
        .command('cubit <name>')
        .alias('cu')
        .description('Generate a Bloc cubit (Bloc projects)')
        .action(async (name: string, options) => {
          try {
            await generateCubit({
              name,
              projectDir: options.project,
              feature: options.feature,
            });
          } catch (error) {
            handleError(error);
          }
        })
    )
  );

  projectOption(
    generate
      .command('service <name>')
      .alias('s')
      .description('Generate an ApiService wrapper in core/network/services/')
      .action(async (name: string, options) => {
        try {
          await generateService({
            name,
            projectDir: options.project,
          });
        } catch (error) {
          handleError(error);
        }
      })
  );
}
