import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  applyFirebaseAddon,
  collectFirebaseDependencies,
  normalizeFirebaseServices,
} from '../src/generators/firebase-addon';
import { buildTemplateContext } from '../src/generators/template';
import { buildProjectContextFields } from '../src/generators/project-config';
import { loadManifest } from '../src/templates/registry';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => fs.remove(dir)));
  tempDirs.length = 0;
});

describe('firebase addon', () => {
  it('collects dependencies for selected services', async () => {
    const deps = await collectFirebaseDependencies({
      enabled: true,
      services: ['auth', 'firestore', 'messaging'],
    });

    expect(deps.dependencies).toMatchObject({
      firebase_core: expect.any(String),
      firebase_auth: expect.any(String),
      cloud_firestore: expect.any(String),
      firebase_messaging: expect.any(String),
    });
  });

  it('returns empty deps when disabled', async () => {
    const deps = await collectFirebaseDependencies({
      enabled: false,
      services: ['auth'],
    });

    expect(deps.dependencies).toEqual({});
  });

  it('scaffolds firebase files for enabled services', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'floom-firebase-'));
    tempDirs.push(dir);

    const selection = {
      architecture: 'clean-architecture' as const,
      state: 'provider' as const,
      networking: 'dio' as const,
      di: 'none' as const,
    };

    const projectConfig = {
      devices: ['mobile'] as const,
      assets: { enabled: false, folders: [] as const },
      firebase: {
        enabled: true,
        services: normalizeFirebaseServices(['auth', 'firestore', 'messaging']),
      },
    };

    const context = {
      ...buildTemplateContext('ShopApp', 'com.example', selection),
      ...buildProjectContextFields(selection, projectConfig),
    };

    await applyFirebaseAddon(dir, context, projectConfig.firebase);

    expect(await fs.pathExists(path.join(dir, 'lib/firebase_options.dart'))).toBe(
      true
    );
    expect(
      await fs.pathExists(path.join(dir, 'lib/core/firebase/services/firebase_auth_service.dart'))
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, 'lib/core/firebase/services/firestore_service.dart'))
    ).toBe(true);
    expect(
      await fs.pathExists(
        path.join(dir, 'lib/core/firebase/services/firebase_messaging_service.dart')
      )
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, 'android/app/google-services.json'))
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(dir, 'ios/Runner/GoogleService-Info.plist'))
    ).toBe(true);

    const bootstrap = await fs.readFile(
      path.join(dir, 'lib/core/bootstrap/app_bootstrap.dart'),
      'utf-8'
    );
    expect(bootstrap).toContain('FirebaseAppService.initialize');
  });

  it('loads firebase services from manifest', async () => {
    const manifest = await loadManifest();
    expect(manifest.addons?.firebase?.services.map((service) => service.id)).toEqual([
      'auth',
      'firestore',
      'messaging',
      'storage',
      'analytics',
    ]);
  });
});
