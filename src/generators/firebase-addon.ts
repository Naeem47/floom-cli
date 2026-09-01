import fs from 'fs-extra';
import path from 'path';
import type { FirebaseConfig, FirebaseServiceId, TemplateContext } from '../types';
import { getFlutterTemplatesDir } from '../utils/paths';
import { loadLayerConfig } from '../templates/registry';
import { copyTemplate } from './template';
import {
  patchAndroidForFirebase,
  scaffoldFirebaseConfigFiles,
} from '../utils/firebase-native';
import { logger } from '../utils/logger';

function getFirebaseAddonDir(): string {
  return path.join(getFlutterTemplatesDir(), 'layers', 'addons', 'firebase');
}

export async function collectFirebaseDependencies(
  firebase: FirebaseConfig
): Promise<{
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}> {
  if (!firebase.enabled) {
    return { dependencies: {}, devDependencies: {} };
  }

  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const baseDir = getFirebaseAddonDir();

  const baseConfig = await loadLayerConfig(baseDir);
  Object.assign(dependencies, baseConfig.dependencies);
  Object.assign(devDependencies, baseConfig.devDependencies);

  for (const service of firebase.services) {
    const serviceDir = path.join(baseDir, 'services', service);
    if (!(await fs.pathExists(serviceDir))) {
      logger.warn(`Firebase service template not found: ${service}`);
      continue;
    }

    const serviceConfig = await loadLayerConfig(serviceDir);
    Object.assign(dependencies, serviceConfig.dependencies);
    Object.assign(devDependencies, serviceConfig.devDependencies);
  }

  return { dependencies, devDependencies };
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
}

export async function applyFirebaseAddon(
  projectDir: string,
  context: TemplateContext,
  firebase: FirebaseConfig
): Promise<void> {
  if (!firebase.enabled) {
    return;
  }

  const baseDir = getFirebaseAddonDir();
  if (!(await fs.pathExists(baseDir))) {
    throw new Error('Firebase addon templates not found');
  }

  await copyLayerContents(baseDir, projectDir, context);

  for (const service of firebase.services) {
    const serviceDir = path.join(baseDir, 'services', service);
    if (await fs.pathExists(serviceDir)) {
      await copyLayerContents(serviceDir, projectDir, context);
    } else {
      logger.warn(`Skipping unknown Firebase service: ${service}`);
    }
  }

  await scaffoldFirebaseConfigFiles(
    projectDir,
    context.packageName,
    context.projectName
  );
  await patchAndroidForFirebase(projectDir);
}

export function normalizeFirebaseServices(
  services: FirebaseServiceId[]
): FirebaseServiceId[] {
  return [...new Set(services)];
}
