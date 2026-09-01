import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import type { CreateOptions, TemplateContext, TemplateSelection } from '../types';
import { DEFAULT_PROJECT_CONFIG } from '../types';
import { logger } from '../utils/logger';
import { commandExists, runCommand } from '../utils/process';
import { resolveProjectDir } from '../utils/paths';
import { injectDependencies, injectFlutterAssets } from '../utils/pubspec';
import {
  collectDependencies,
  formatSelectionLabel,
  getAssetPaths,
  getLayerPaths,
} from '../templates/registry';
import { buildProjectContextFields } from './project-config';
import { buildTemplateContext, copyTemplate } from './template';
import {
  applyFirebaseAddon,
  collectFirebaseDependencies,
} from './firebase-addon';

const DEFAULT_ORG = 'com.example';

export async function generateFlutterProject(
  options: CreateOptions
): Promise<string> {
  const {
    name,
    outputDir,
    org = DEFAULT_ORG,
    skipFlutterCreate = false,
    skipPubGet = false,
  } = options;

  const selection = options.selection;
  if (!selection) {
    throw new Error('Template selection is required');
  }

  const projectConfig = options.projectConfig ?? DEFAULT_PROJECT_CONFIG;
  const projectDir = resolveProjectDir(name, outputDir);
  const layerPaths = await getLayerPaths(selection);
  const context: TemplateContext = {
    ...buildTemplateContext(name, org, selection),
    ...buildProjectContextFields(selection, projectConfig),
  };

  if (await fs.pathExists(projectDir)) {
    throw new Error(`Directory already exists: ${projectDir}`);
  }

  if (!skipFlutterCreate) {
    const hasFlutter = await commandExists('flutter');
    if (!hasFlutter) {
      throw new Error(
        'Flutter SDK not found. Install Flutter or pass --skip-flutter-create.'
      );
    }

    const spinner = ora('Creating Flutter project...').start();

    try {
      await runCommand(
        'flutter',
        ['create', '--org', org, '--project-name', name, projectDir],
        { silent: true }
      );
      spinner.succeed('Flutter project created');
    } catch (error) {
      spinner.fail('Failed to create Flutter project');
      throw error;
    }
  } else {
    await fs.ensureDir(projectDir);
    logger.info('Skipped flutter create; using template only');
  }

  const label = formatSelectionLabel(selection, projectConfig);
  const spinner = ora(`Applying template (${label})...`).start();

  try {
    await applyLayeredTemplate(layerPaths, projectDir, context);
    await scaffoldAssets(projectDir, projectConfig);
    await applyFirebaseAddon(projectDir, context, projectConfig.firebase);
    spinner.succeed('Template applied');
  } catch (error) {
    spinner.fail('Failed to apply template');
    throw error;
  }

  await mergePubspec(projectDir, selection, projectConfig);

  if (!skipPubGet && (await commandExists('flutter'))) {
    const pubSpinner = ora('Running flutter pub get...').start();
    try {
      await runCommand('flutter', ['pub', 'get'], {
        cwd: projectDir,
        silent: true,
      });
      pubSpinner.succeed('Dependencies installed');
    } catch (error) {
      pubSpinner.fail('flutter pub get failed — run it manually inside the project');
      logger.debug(String(error));
    }
  }

  logger.success(`Project ready at ${projectDir}`);
  logger.info(`Template: ${label}`);
  logger.info(`Next steps:`);
  logger.info(`  cd ${name}`);
  if (skipPubGet || !(await commandExists('flutter'))) {
    logger.info(`  flutter pub get`);
  }
  logger.info(`  flutter run`);
  if (projectConfig.firebase.enabled) {
    logger.info(`  Firebase: configure with flutterfire configure`);
  }

  return projectDir;
}

async function applyLayeredTemplate(
  layerPaths: string[],
  projectDir: string,
  context: TemplateContext
): Promise<void> {
  for (const layerDir of layerPaths) {
    await applyLayer(layerDir, projectDir, context);
  }
}

async function applyLayer(
  layerDir: string,
  projectDir: string,
  context: TemplateContext
): Promise<void> {
  await copyLayerContents(layerDir, projectDir, context);

  const overlayPaths = [
    path.join(layerDir, 'overlays', context.architecture),
    path.join(layerDir, 'overlays', 'networking', context.networking),
    path.join(layerDir, 'overlays', 'states', context.state),
  ];

  for (const overlayDir of overlayPaths) {
    if (await fs.pathExists(overlayDir)) {
      await copyLayerContents(overlayDir, projectDir, context);
    }
  }
}

async function copyLayerContents(
  layerDir: string,
  projectDir: string,
  context: TemplateContext
): Promise<void> {
  const libSource = path.join(layerDir, 'lib');
  const libTarget = path.join(projectDir, 'lib');

  if (await fs.pathExists(libSource)) {
    await fs.ensureDir(libTarget);
    await copyTemplate(libSource, libTarget, context);
  }

  const testSource = path.join(layerDir, 'test');
  const testTarget = path.join(projectDir, 'test');
  if (await fs.pathExists(testSource)) {
    await fs.ensureDir(testTarget);
    await copyTemplate(testSource, testTarget, context);
  }

  const analysisOptions = path.join(layerDir, 'analysis_options.yaml');
  if (await fs.pathExists(analysisOptions)) {
    await fs.copy(
      analysisOptions,
      path.join(projectDir, 'analysis_options.yaml')
    );
  }
}

async function scaffoldAssets(
  projectDir: string,
  projectConfig: CreateOptions['projectConfig']
): Promise<void> {
  if (!projectConfig?.assets.enabled) {
    return;
  }

  for (const folder of projectConfig.assets.folders) {
    const assetDir = path.join(projectDir, 'assets', folder);
    await fs.ensureDir(assetDir);
    await fs.writeFile(path.join(assetDir, '.gitkeep'), '', 'utf-8');
  }
}

async function mergePubspec(
  projectDir: string,
  selection: TemplateSelection,
  projectConfig: CreateOptions['projectConfig']
): Promise<void> {
  const pubspecPath = path.join(projectDir, 'pubspec.yaml');
  const { dependencies, devDependencies } = await collectDependencies(selection);
  const firebaseDeps = await collectFirebaseDependencies(
    projectConfig?.firebase ?? DEFAULT_PROJECT_CONFIG.firebase
  );

  if (!(await fs.pathExists(pubspecPath))) {
    await fs.writeFile(
      pubspecPath,
      `name: ${path.basename(projectDir)}\n`,
      'utf-8'
    );
    logger.warn('Created minimal pubspec.yaml');
  }

  let pubspec = await fs.readFile(pubspecPath, 'utf-8');
  pubspec = injectDependencies(pubspec, 'dependencies', {
    ...dependencies,
    ...firebaseDeps.dependencies,
  });
  pubspec = injectDependencies(pubspec, 'dev_dependencies', {
    ...devDependencies,
    ...firebaseDeps.devDependencies,
  });

  const assetPaths = getAssetPaths(projectConfig ?? DEFAULT_PROJECT_CONFIG);
  pubspec = injectFlutterAssets(pubspec, assetPaths);

  await fs.writeFile(pubspecPath, pubspec, 'utf-8');
}
