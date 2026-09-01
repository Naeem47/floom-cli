export type ArchitectureId =
  | 'clean-architecture'
  | 'feature-first'
  | 'minimal'
  | 'mvc';
export type StateId = 'riverpod' | 'bloc' | 'provider' | 'none';
export type NetworkingId = 'dio' | 'http' | 'none';
export type DiId = 'none' | 'get_it' | 'injectable';
export type DeviceTarget = 'mobile' | 'tablet' | 'desktop';
export type AssetFolder = 'images' | 'icons' | 'fonts' | 'lottie';
export type FirebaseServiceId =
  | 'auth'
  | 'firestore'
  | 'messaging'
  | 'storage'
  | 'analytics';

export interface FirebaseConfig {
  enabled: boolean;
  services: FirebaseServiceId[];
}

export interface FirebaseServiceOption {
  id: FirebaseServiceId;
  label: string;
  description?: string;
}

export interface FirebaseAddonManifest {
  label: string;
  description?: string;
  defaultServices: FirebaseServiceId[];
  services: FirebaseServiceOption[];
}

export interface TemplateSelection {
  architecture: ArchitectureId;
  state: StateId;
  networking: NetworkingId;
  di: DiId;
}

export interface ProjectConfig {
  devices: DeviceTarget[];
  assets: {
    enabled: boolean;
    folders: AssetFolder[];
  };
  firebase: FirebaseConfig;
}

export interface CreateOptions {
  name: string;
  outputDir?: string;
  org?: string;
  skipFlutterCreate?: boolean;
  selection?: TemplateSelection;
  projectConfig?: ProjectConfig;
  /** @deprecated Use selection instead */
  template?: string;
  defaults?: boolean;
  skipPubGet?: boolean;
}

export interface FeatureOptions {
  name: string;
  projectDir?: string;
  withTests?: boolean;
}

export interface GenerateModuleOptions extends FeatureOptions {}

export interface TemplateContext extends TemplateSelection {
  projectName: string;
  projectNameSnake: string;
  projectNamePascal: string;
  org: string;
  packageName: string;
  designMobileWidth: string;
  designMobileHeight: string;
  designTabletWidth: string;
  designTabletHeight: string;
  designDesktopWidth: string;
  designDesktopHeight: string;
  primaryDesignWidth: string;
  primaryDesignHeight: string;
  includeMobile: string;
  includeTablet: string;
  includeDesktop: string;
  includeAssets: string;
  includeFirebase: string;
  includeFirebaseAuth: string;
  includeFirebaseFirestore: string;
  includeFirebaseMessaging: string;
  includeFirebaseStorage: string;
  includeFirebaseAnalytics: string;
}

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

export interface TemplateLayerOption {
  id: string;
  label: string;
  description?: string;
}

export interface TemplateLayerCategory {
  label: string;
  default: string;
  options: TemplateLayerOption[];
}

export interface TemplateManifest {
  version: number;
  composeOrder: string[];
  foundationLayers?: string[];
  layers: Record<string, TemplateLayerCategory>;
  addons?: {
    firebase?: FirebaseAddonManifest;
  };
  legacyTemplates?: Record<string, Partial<TemplateSelection>>;
}

export interface LayerConfig {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export const DEVICE_DESIGN_SIZES: Record<
  DeviceTarget,
  { width: number; height: number }
> = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  enabled: false,
  services: [],
};

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  devices: ['mobile', 'tablet', 'desktop'],
  assets: {
    enabled: true,
    folders: ['images', 'icons'],
  },
  firebase: DEFAULT_FIREBASE_CONFIG,
};
