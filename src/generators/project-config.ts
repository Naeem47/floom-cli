import type {
  ProjectConfig,
  TemplateContext,
  TemplateSelection,
} from '../types';
import { DEVICE_DESIGN_SIZES } from '../types';

export function buildProjectContextFields(
  selection: TemplateSelection,
  projectConfig: ProjectConfig
): Pick<
  TemplateContext,
  | 'designMobileWidth'
  | 'designMobileHeight'
  | 'designTabletWidth'
  | 'designTabletHeight'
  | 'designDesktopWidth'
  | 'designDesktopHeight'
  | 'primaryDesignWidth'
  | 'primaryDesignHeight'
  | 'includeMobile'
  | 'includeTablet'
  | 'includeDesktop'
  | 'includeAssets'
  | 'includeFirebase'
  | 'includeFirebaseAuth'
  | 'includeFirebaseFirestore'
  | 'includeFirebaseMessaging'
  | 'includeFirebaseStorage'
  | 'includeFirebaseAnalytics'
> {
  const devices =
    projectConfig.devices.length > 0
      ? projectConfig.devices
      : (['mobile'] as ProjectConfig['devices']);

  const primary = devices[0] ?? 'mobile';
  const primarySize = DEVICE_DESIGN_SIZES[primary];

  const firebase = projectConfig.firebase;
  const services = new Set(firebase.services);

  return {
    designMobileWidth: String(DEVICE_DESIGN_SIZES.mobile.width),
    designMobileHeight: String(DEVICE_DESIGN_SIZES.mobile.height),
    designTabletWidth: String(DEVICE_DESIGN_SIZES.tablet.width),
    designTabletHeight: String(DEVICE_DESIGN_SIZES.tablet.height),
    designDesktopWidth: String(DEVICE_DESIGN_SIZES.desktop.width),
    designDesktopHeight: String(DEVICE_DESIGN_SIZES.desktop.height),
    primaryDesignWidth: String(primarySize.width),
    primaryDesignHeight: String(primarySize.height),
    includeMobile: String(devices.includes('mobile')),
    includeTablet: String(devices.includes('tablet')),
    includeDesktop: String(devices.includes('desktop')),
    includeAssets: String(projectConfig.assets.enabled),
    includeFirebase: String(firebase.enabled),
    includeFirebaseAuth: String(firebase.enabled && services.has('auth')),
    includeFirebaseFirestore: String(firebase.enabled && services.has('firestore')),
    includeFirebaseMessaging: String(firebase.enabled && services.has('messaging')),
    includeFirebaseStorage: String(firebase.enabled && services.has('storage')),
    includeFirebaseAnalytics: String(firebase.enabled && services.has('analytics')),
  };
}
