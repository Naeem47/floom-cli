import fs from 'fs-extra';
import path from 'path';
import type { ArchitectureId, StateId } from '../types';

export interface ProjectContext {
  projectDir: string;
  architecture: ArchitectureId | 'unknown';
  state: StateId | 'unknown';
  hasApiService: boolean;
  hasDio: boolean;
  hasHttp: boolean;
}

async function fileContains(
  filePath: string,
  needle: string
): Promise<boolean> {
  if (!(await fs.pathExists(filePath))) {
    return false;
  }

  const content = await fs.readFile(filePath, 'utf-8');
  return content.includes(needle);
}

async function detectStateFromHomeFeature(
  libDir: string
): Promise<StateId | null> {
  const homeRoot = path.join(libDir, 'features', 'home');
  if (!(await fs.pathExists(homeRoot))) {
    return null;
  }

  const candidates = [
    path.join(homeRoot, 'presentation', 'providers', 'home_provider.dart'),
    path.join(homeRoot, 'providers', 'home_provider.dart'),
    path.join(homeRoot, 'presentation', 'providers', 'home_notifier.dart'),
    path.join(homeRoot, 'providers', 'home_notifier.dart'),
    path.join(homeRoot, 'presentation', 'cubit', 'home_cubit.dart'),
    path.join(homeRoot, 'cubit', 'home_cubit.dart'),
  ];

  for (const candidate of candidates) {
    if (!(await fs.pathExists(candidate))) {
      continue;
    }

    if (candidate.endsWith('home_provider.dart')) {
      if (await fileContains(candidate, 'flutter_riverpod')) {
        return 'riverpod';
      }
    }

    if (candidate.endsWith('home_notifier.dart')) {
      if (await fileContains(candidate, 'ChangeNotifier')) {
        return 'provider';
      }
    }

    if (candidate.endsWith('home_cubit.dart')) {
      return 'bloc';
    }
  }

  return null;
}

function detectStateFromPubspec(pubspec: string): StateId {
  if (/\bflutter_riverpod:\s/.test(pubspec)) {
    return 'riverpod';
  }
  if (/\bflutter_bloc:\s/.test(pubspec)) {
    return 'bloc';
  }
  if (/\bprovider:\s/.test(pubspec)) {
    return 'provider';
  }
  return 'none';
}

export async function detectProjectContext(
  projectDir: string
): Promise<ProjectContext> {
  const libDir = path.join(projectDir, 'lib');
  const pubspecPath = path.join(projectDir, 'pubspec.yaml');

  if (!(await fs.pathExists(pubspecPath))) {
    throw new Error(
      'Not a Flutter project. Run this command inside a project directory.'
    );
  }

  const pubspec = await fs.readFile(pubspecPath, 'utf-8');
  const hasDio = /\bdio:\s/.test(pubspec);
  const hasHttp = /\bhttp:\s/.test(pubspec);
  const hasApiService = await fs.pathExists(
    path.join(libDir, 'core', 'network', 'api_service.dart')
  );

  let architecture: ProjectContext['architecture'] = 'unknown';

  if (await fs.pathExists(path.join(libDir, 'features', 'home', 'controllers'))) {
    architecture = 'mvc';
  } else if (
    (await fs.pathExists(path.join(libDir, 'features', 'home', 'domain'))) ||
    (await fs.pathExists(
      path.join(libDir, 'features', 'home', 'presentation')
    ))
  ) {
    architecture = 'clean-architecture';
  } else if (
    await fs.pathExists(path.join(libDir, 'features', 'home', 'models'))
  ) {
    architecture = 'feature-first';
  } else if (await fs.pathExists(path.join(libDir, 'pages'))) {
    architecture = 'minimal';
  } else {
    architecture = 'clean-architecture';
  }

  const stateFromHome = await detectStateFromHomeFeature(libDir);
  const state = stateFromHome ?? detectStateFromPubspec(pubspec);

  return {
    projectDir,
    architecture,
    state,
    hasApiService,
    hasDio,
    hasHttp,
  };
}

export function featureRoot(
  ctx: ProjectContext,
  featureSnake: string
): string {
  return path.join(ctx.projectDir, 'lib', 'features', featureSnake);
}
