import fs from 'fs-extra';
import path from 'path';
import type {
  LayerConfig,
  ProjectConfig,
  TemplateManifest,
  TemplateSelection,
} from '../types';
import { DEFAULT_PROJECT_CONFIG } from '../types';
import { getFlutterTemplatesDir } from '../utils/paths';

let cachedManifest: TemplateManifest | null = null;

export function getManifestPath(): string {
  return path.join(getFlutterTemplatesDir(), 'manifest.json');
}

export async function loadManifest(): Promise<TemplateManifest> {
  if (cachedManifest) {
    return cachedManifest;
  }

  const manifestPath = getManifestPath();
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`Template manifest not found: ${manifestPath}`);
  }

  cachedManifest = await fs.readJson(manifestPath);
  return cachedManifest!;
}

export function getLayerDir(category: string, optionId: string): string {
  return path.join(getFlutterTemplatesDir(), 'layers', category, optionId);
}

export async function loadLayerConfig(layerDir: string): Promise<LayerConfig> {
  const configPath = path.join(layerDir, 'template.json');
  if (!(await fs.pathExists(configPath))) {
    return {};
  }

  return fs.readJson(configPath);
}

export async function resolveTemplateSelection(
  input: Partial<TemplateSelection> & { template?: string }
): Promise<TemplateSelection> {
  const manifest = await loadManifest();

  if (input.template) {
    const legacy = manifest.legacyTemplates?.[input.template];
    if (legacy) {
      const defaults = getDefaultSelection(manifest);
      return {
        architecture: input.architecture ?? legacy.architecture ?? defaults.architecture,
        state: input.state ?? legacy.state ?? defaults.state,
        networking: input.networking ?? legacy.networking ?? defaults.networking,
        di: input.di ?? legacy.di ?? defaults.di,
      };
    }
  }

  const defaults = getDefaultSelection(manifest);
  return {
    architecture: input.architecture ?? defaults.architecture,
    state: input.state ?? defaults.state,
    networking: input.networking ?? defaults.networking,
    di: input.di ?? defaults.di,
  };
}

export function getDefaultSelection(
  manifest: TemplateManifest
): TemplateSelection {
  return {
    architecture: manifest.layers.architecture.default as TemplateSelection['architecture'],
    state: manifest.layers.state.default as TemplateSelection['state'],
    networking: manifest.layers.networking.default as TemplateSelection['networking'],
    di: manifest.layers.di.default as TemplateSelection['di'],
  };
}

export function getDefaultProjectConfig(): ProjectConfig {
  return structuredClone(DEFAULT_PROJECT_CONFIG);
}

export async function getLayerPaths(
  selection: TemplateSelection
): Promise<string[]> {
  const manifest = await loadManifest();
  const paths: string[] = [];

  for (const category of manifest.composeOrder) {
    const optionId = selection[category as keyof TemplateSelection];
    const layerDir = getLayerDir(category, optionId);

    if (!(await fs.pathExists(layerDir))) {
      throw new Error(`Template layer not found: ${category}/${optionId}`);
    }

    paths.push(layerDir);
  }

  for (const foundationLayer of manifest.foundationLayers ?? []) {
    const layerDir = path.join(getFlutterTemplatesDir(), 'layers', foundationLayer);
    if (await fs.pathExists(layerDir)) {
      paths.push(layerDir);
    }
  }

  return paths;
}

function formatFirebaseLabel(
  firebase: ProjectConfig['firebase']
): string | null {
  if (!firebase.enabled) {
    return null;
  }

  if (firebase.services.length === 0) {
    return 'firebase (core only)';
  }

  return `firebase (${firebase.services.join(', ')})`;
}

export async function collectDependencies(
  selection: TemplateSelection
): Promise<{ dependencies: Record<string, string>; devDependencies: Record<string, string> }> {
  const layerPaths = await getLayerPaths(selection);
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  for (const layerDir of layerPaths) {
    const config = await loadLayerConfig(layerDir);
    Object.assign(dependencies, config.dependencies);
    Object.assign(devDependencies, config.devDependencies);
  }

  return { dependencies, devDependencies };
}

export function formatSelectionLabel(
  selection: TemplateSelection,
  projectConfig?: ProjectConfig
): string {
  const parts: string[] = [
    selection.architecture,
    selection.state,
    selection.networking,
    selection.di,
  ];

  const firebaseLabel = formatFirebaseLabel(
    projectConfig?.firebase ?? DEFAULT_PROJECT_CONFIG.firebase
  );
  if (firebaseLabel) {
    parts.push(firebaseLabel);
  }

  return parts.join(' + ');
}

export function getAssetPaths(config: ProjectConfig): string[] {
  if (!config.assets.enabled) {
    return [];
  }

  return config.assets.folders.map((folder) => `assets/${folder}/`);
}
