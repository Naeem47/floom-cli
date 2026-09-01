import { checkbox, confirm, select } from '@inquirer/prompts';
import type {
  ArchitectureId,
  AssetFolder,
  DeviceTarget,
  DiId,
  FirebaseServiceId,
  NetworkingId,
  ProjectConfig,
  StateId,
  TemplateManifest,
  TemplateSelection,
} from '../types';
import { DEFAULT_PROJECT_CONFIG } from '../types';
import { getDefaultProjectConfig, getDefaultSelection } from '../templates/registry';
import { normalizeFirebaseServices } from '../generators/firebase-addon';

async function promptLayer<T extends string>(
  message: string,
  options: Array<{ id: T; label: string; description?: string }>,
  defaultValue: T,
  partial?: T
): Promise<T> {
  if (partial) {
    return partial;
  }

  return select({
    message,
    choices: options.map((option) => ({
      name: option.label,
      value: option.id,
      description: option.description,
    })),
    default: defaultValue,
  });
}

export async function promptTemplateSelection(
  manifest: TemplateManifest,
  partial: Partial<TemplateSelection> = {}
): Promise<TemplateSelection> {
  const defaults = getDefaultSelection(manifest);

  const architecture = await promptLayer(
    manifest.layers.architecture.label,
    manifest.layers.architecture.options.map((option) => ({
      id: option.id as ArchitectureId,
      label: option.label,
      description: option.description,
    })),
    defaults.architecture,
    partial.architecture
  );

  const state = await promptLayer(
    manifest.layers.state.label,
    manifest.layers.state.options.map((option) => ({
      id: option.id as StateId,
      label: option.label,
      description: option.description,
    })),
    defaults.state,
    partial.state
  );

  const networking = await promptLayer(
    manifest.layers.networking.label,
    manifest.layers.networking.options.map((option) => ({
      id: option.id as NetworkingId,
      label: option.label,
      description: option.description,
    })),
    defaults.networking,
    partial.networking
  );

  const diDefault =
    state === 'riverpod' ? ('none' as DiId) : defaults.di;

  const di = await promptLayer(
    manifest.layers.di.label,
    manifest.layers.di.options.map((option) => ({
      id: option.id as DiId,
      label: option.label,
      description: option.description,
    })),
    diDefault,
    partial.di
  );

  return { architecture, state, networking, di };
}

export async function promptProjectConfig(
  manifest: TemplateManifest,
  partial: Partial<ProjectConfig> = {},
  useDefaults = false
): Promise<ProjectConfig> {
  if (useDefaults && Object.keys(partial).length === 0) {
    return getDefaultProjectConfig();
  }

  const defaults = getDefaultProjectConfig();

  const devices =
    partial.devices ??
    ((await checkbox({
      message: 'Target devices (design sizes)',
      choices: [
        {
          name: 'Mobile (375 x 812)',
          value: 'mobile' as DeviceTarget,
          checked: defaults.devices.includes('mobile'),
        },
        {
          name: 'Tablet (768 x 1024)',
          value: 'tablet' as DeviceTarget,
          checked: defaults.devices.includes('tablet'),
        },
        {
          name: 'Desktop (1440 x 900)',
          value: 'desktop' as DeviceTarget,
          checked: defaults.devices.includes('desktop'),
        },
      ],
      validate: (value) =>
        value.length > 0 ? true : 'Select at least one device target',
    })) as DeviceTarget[]);

  const includeAssets =
    partial.assets?.enabled ??
    (await confirm({
      message: 'Scaffold assets folders in pubspec.yaml?',
      default: defaults.assets.enabled,
    }));

  let folders = partial.assets?.folders ?? defaults.assets.folders;

  if (includeAssets && !partial.assets?.folders) {
    folders = (await checkbox({
      message: 'Asset folders to create',
      choices: [
        { name: 'assets/images/', value: 'images' as AssetFolder, checked: true },
        { name: 'assets/icons/', value: 'icons' as AssetFolder, checked: true },
        { name: 'assets/fonts/', value: 'fonts' as AssetFolder, checked: false },
        { name: 'assets/lottie/', value: 'lottie' as AssetFolder, checked: false },
      ],
      validate: (value) =>
        value.length > 0 ? true : 'Select at least one asset folder',
    })) as AssetFolder[];
  }

  return {
    devices,
    assets: {
      enabled: includeAssets,
      folders: includeAssets ? folders : [],
    },
    firebase: await promptFirebaseConfig(manifest, partial.firebase),
  };
}

async function promptFirebaseConfig(
  manifest: TemplateManifest,
  partial?: ProjectConfig['firebase']
): Promise<ProjectConfig['firebase']> {
  if (partial?.enabled !== undefined && partial.services !== undefined) {
    return {
      enabled: partial.enabled,
      services: normalizeFirebaseServices(partial.services),
    };
  }

  const firebaseManifest = manifest.addons?.firebase;
  if (!firebaseManifest) {
    return DEFAULT_PROJECT_CONFIG.firebase;
  }

  const enabled =
    partial?.enabled ??
    (await confirm({
      message: 'Enable Firebase?',
      default: false,
    }));

  if (!enabled) {
    return { enabled: false, services: [] };
  }

  const services = (await checkbox({
    message: 'Firebase services to scaffold',
    choices: firebaseManifest.services.map((service) => ({
      name: service.label,
      value: service.id as FirebaseServiceId,
      description: service.description,
      checked: firebaseManifest.defaultServices.includes(service.id as FirebaseServiceId),
    })),
    validate: (value) =>
      value.length > 0 ? true : 'Select at least one Firebase service',
  })) as FirebaseServiceId[];

  return {
    enabled: true,
    services: normalizeFirebaseServices(services),
  };
}

export async function promptCreateConfiguration(
  manifest: TemplateManifest,
  partialSelection: Partial<TemplateSelection> = {},
  partialProject: Partial<ProjectConfig> = {},
  useDefaults = false
): Promise<{ selection: TemplateSelection; projectConfig: ProjectConfig }> {
  const selection = useDefaults
    ? {
        ...getDefaultSelection(manifest),
        ...partialSelection,
      }
    : await promptTemplateSelection(manifest, partialSelection);

  const projectConfig = useDefaults
    ? { ...getDefaultProjectConfig(), ...partialProject }
    : await promptProjectConfig(manifest, partialProject, false);

  return { selection, projectConfig };
}
