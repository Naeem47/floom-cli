#!/usr/bin/env node

import { Command } from 'commander';
import { registerCreateCommand } from './commands/create';
import { registerFeatureCommand } from './commands/feature';
import { registerGenerateCommand } from './commands/generate';

const program = new Command();

program
  .name('floom')
  .description('CLI for scaffolding Flutter projects from composable templates')
  .version('0.1.0');

registerCreateCommand(program);
registerGenerateCommand(program);
registerFeatureCommand(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
