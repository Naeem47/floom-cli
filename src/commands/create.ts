import { Command } from 'commander';
import type {
  AssetFolder,
  CreateOptions,
  DeviceTarget,
  FirebaseServiceId,
  TemplateSelection,
} from '../types';
import { generateFlutterProject } from '../generators/flutter';
import { normalizeFirebaseServices } from '../generators/firebase-addon';
import { logger } from '../utils/logger';
import {
  getDefaultProjectConfig,
  loadManifest,
  resolveTemplateSelection,
} from '../templates/registry';
import { promptCreateConfiguration } from '../prompts/create';

function parseProjectConfigFromOptions(options: {
  devices?: string;
  assets?: boolean;
  assetFolders?: string;
  firebase?: boolean;
  firebaseServices?: string;
}): Partial<CreateOptions['projectConfig']> {
  const partial: Partial<CreateOptions['projectConfig']> = {};

  if (options.devices) {
    partial.devices = options.devices
      .split(',')
      .map((value) => value.trim()) as DeviceTarget[];
  }

  if (options.assetFolders) {
    partial.assets = {
      enabled: options.assets !== false,
      folders: options.assetFolders
        .split(',')
        .map((value) => value.trim()) as AssetFolder[],
    };
  } else if (options.assets === false) {
    partial.assets = { enabled: false, folders: [] };
  }

  if (options.firebase === true) {
    partial.firebase = {
      enabled: true,
      services: options.firebaseServices
        ? (options.firebaseServices
            .split(',')
            .map((value) => value.trim()) as FirebaseServiceId[])
        : [],
    };
  } else if (options.firebase === false) {
    partial.firebase = { enabled: false, services: [] };
  } else if (options.firebaseServices) {
    partial.firebase = {
      enabled: true,
      services: normalizeFirebaseServices(
        options.firebaseServices
          .split(',')
          .map((value) => value.trim()) as FirebaseServiceId[]
      ),
    };
  }

  return partial;
}

export function registerCreateCommand(program: Command): void {
  program
    .command('create')
    .description('Create a new Flutter project from composable templates')
    .argument('<name>', 'Project name')
    .option('-o, --output <dir>', 'Output directory', process.cwd())
    .option('--org <org>', 'Organization identifier', 'com.example')
    .option(
      '--architecture <id>',
      'Architecture: clean-architecture | feature-first | mvc | minimal'
    )
    .option(
      '--state <id>',
      'State management: riverpod | bloc | provider | none'
    )
    .option(
      '--networking <id>',
      'Networking: dio | http | none'
    )
    .option(
      '--di <id>',
      'Dependency injection: none | get_it | injectable'
    )
    .option(
      '--devices <list>',
      'Comma-separated targets: mobile,tablet,desktop'
    )
    .option('--no-assets', 'Skip asset folder scaffolding')
    .option(
      '--asset-folders <list>',
      'Comma-separated asset folders: images,icons,fonts,lottie'
    )
    .option('--firebase', 'Enable Firebase addon')
    .option('--no-firebase', 'Disable Firebase addon')
    .option(
      '--firebase-services <list>',
      'Firebase services: auth,firestore,messaging,storage,analytics'
    )
    .option(
      '-t, --template <template>',
      'Legacy preset (e.g. clean-riverpod)'
    )
    .option(
      '-y, --defaults',
      'Use default options without interactive prompts',
      false
    )
    .option(
      '--skip-flutter-create',
      'Skip running flutter create (template files only)',
      false
    )
    .option('--skip-pub-get', 'Skip running flutter pub get after generation', false)
    .action(async (name: string, options) => {
      try {
        const manifest = await loadManifest();
        const partialSelection: Partial<TemplateSelection> = {};
        const partialProject = parseProjectConfigFromOptions(options);

        if (options.architecture) partialSelection.architecture = options.architecture;
        if (options.state) partialSelection.state = options.state;
        if (options.networking) partialSelection.networking = options.networking;
        if (options.di) partialSelection.di = options.di;

        const skipPrompts =
          options.defaults ||
          Boolean(options.template) ||
          Object.keys(partialSelection).length === manifest.composeOrder.length;

        let selection: TemplateSelection;
        let projectConfig: NonNullable<CreateOptions['projectConfig']>;

        if (skipPrompts) {
          selection = await resolveTemplateSelection({
            template: options.template,
            ...partialSelection,
          });
          projectConfig = {
            ...getDefaultProjectConfig(),
            ...partialProject,
            assets: {
              ...getDefaultProjectConfig().assets,
              ...(partialProject?.assets ?? {}),
            },
            firebase: {
              ...getDefaultProjectConfig().firebase,
              ...(partialProject?.firebase ?? {}),
            },
          };

          if (
            projectConfig.firebase.enabled &&
            projectConfig.firebase.services.length === 0
          ) {
            projectConfig.firebase.services = normalizeFirebaseServices(
              manifest.addons?.firebase?.defaultServices ?? [
                'auth',
                'firestore',
                'messaging',
              ]
            );
          }
        } else {
          ({ selection, projectConfig } = await promptCreateConfiguration(
            manifest,
            partialSelection,
            partialProject,
            false
          ));
        }

        await generateFlutterProject({
          name,
          outputDir: options.output,
          org: options.org,
          skipFlutterCreate: options.skipFlutterCreate,
          skipPubGet: options.skipPubGet,
          selection,
          projectConfig,
          defaults: options.defaults,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(message);
        process.exit(1);
      }
    });
}
