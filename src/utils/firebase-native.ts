import fs from 'fs-extra';
import path from 'path';
import { getFlutterTemplatesDir } from './paths';
import { logger } from './logger';

const GOOGLE_SERVICES_CLASSPATH =
  "classpath 'com.google.gms:google-services:4.4.2'";
const GOOGLE_SERVICES_PLUGIN_KOTLIN =
  'id("com.google.gms.google-services") version "4.4.2" apply false';
const GOOGLE_SERVICES_PLUGIN_GROOVY =
  "id 'com.google.gms.google-services' version '4.4.2' apply false";
const APP_GOOGLE_SERVICES_KOTLIN = 'id("com.google.gms.google-services")';
const APP_GOOGLE_SERVICES_GROOVY = "id 'com.google.gms.google-services'";

export async function patchAndroidForFirebase(projectDir: string): Promise<void> {
  const androidDir = path.join(projectDir, 'android');
  if (!(await fs.pathExists(androidDir))) {
    logger.debug('Skipped Android Firebase patch — android/ not found');
    return;
  }

  await patchRootGradle(androidDir);
  await patchSettingsGradle(androidDir);
  await patchAppGradle(androidDir);
}

async function patchRootGradle(androidDir: string): Promise<void> {
  for (const fileName of ['build.gradle', 'build.gradle.kts']) {
    const filePath = path.join(androidDir, fileName);
    if (!(await fs.pathExists(filePath))) {
      continue;
    }

    let content = await fs.readFile(filePath, 'utf-8');
    if (content.includes('google-services')) {
      return;
    }

    if (fileName.endsWith('.kts')) {
      if (/dependencies\s*\{/.test(content)) {
        content = content.replace(
          /dependencies\s*\{/,
          `dependencies {\n        classpath("com.google.gms:google-services:4.4.2")`
        );
      } else {
        content += `\nbuildscript {\n    dependencies {\n        classpath("com.google.gms:google-services:4.4.2")\n    }\n}\n`;
      }
    } else if (/dependencies\s*\{/.test(content)) {
      content = content.replace(
        /dependencies\s*\{/,
        `dependencies {\n        ${GOOGLE_SERVICES_CLASSPATH}`
      );
    } else {
      content += `\nbuildscript {\n    dependencies {\n        ${GOOGLE_SERVICES_CLASSPATH}\n    }\n}\n`;
    }

    await fs.writeFile(filePath, content, 'utf-8');
    logger.debug(`Patched ${filePath} for Firebase`);
    return;
  }
}

async function patchSettingsGradle(androidDir: string): Promise<void> {
  for (const fileName of ['settings.gradle.kts', 'settings.gradle']) {
    const filePath = path.join(androidDir, fileName);
    if (!(await fs.pathExists(filePath))) {
      continue;
    }

    let content = await fs.readFile(filePath, 'utf-8');
    if (content.includes('google-services')) {
      return;
    }

    if (fileName.endsWith('.kts')) {
      if (/plugins\s*\{/.test(content)) {
        content = content.replace(
          /plugins\s*\{/,
          `plugins {\n    ${GOOGLE_SERVICES_PLUGIN_KOTLIN}`
        );
      }
    } else if (/plugins\s*\{/.test(content)) {
      content = content.replace(
        /plugins\s*\{/,
        `plugins {\n    ${GOOGLE_SERVICES_PLUGIN_GROOVY}`
      );
    }

    await fs.writeFile(filePath, content, 'utf-8');
    logger.debug(`Patched ${filePath} for Firebase`);
    return;
  }
}

async function patchAppGradle(androidDir: string): Promise<void> {
  const appDir = path.join(androidDir, 'app');
  for (const fileName of ['build.gradle.kts', 'build.gradle']) {
    const filePath = path.join(appDir, fileName);
    if (!(await fs.pathExists(filePath))) {
      continue;
    }

    let content = await fs.readFile(filePath, 'utf-8');
    if (content.includes('google-services')) {
      return;
    }

    if (fileName.endsWith('.kts')) {
      if (/plugins\s*\{/.test(content)) {
        content = content.replace(
          /plugins\s*\{/,
          `plugins {\n    ${APP_GOOGLE_SERVICES_KOTLIN}`
        );
      } else {
        content = `plugins {\n    ${APP_GOOGLE_SERVICES_KOTLIN}\n}\n\n${content}`;
      }
    } else if (/plugins\s*\{/.test(content)) {
      content = content.replace(
        /plugins\s*\{/,
        `plugins {\n    ${APP_GOOGLE_SERVICES_GROOVY}`
      );
    } else {
      content = `plugins {\n    ${APP_GOOGLE_SERVICES_GROOVY}\n}\n\n${content}`;
    }

    await fs.writeFile(filePath, content, 'utf-8');
    logger.debug(`Patched ${filePath} for Firebase`);
    return;
  }
}

export async function scaffoldFirebaseConfigFiles(
  projectDir: string,
  packageName: string,
  projectName: string
): Promise<void> {
  const configDir = path.join(
    getFlutterTemplatesDir(),
    'layers',
    'addons',
    'firebase',
    'config'
  );

  const replacements = {
    '{{packageName}}': packageName,
    '{{projectName}}': projectName,
  };

  const configFiles = [
    {
      source: 'firebase.json',
      target: 'firebase.json',
    },
    {
      source: 'android/app/google-services.json',
      target: 'android/app/google-services.json',
    },
    {
      source: 'ios/Runner/GoogleService-Info.plist',
      target: 'ios/Runner/GoogleService-Info.plist',
    },
  ];

  for (const file of configFiles) {
    const sourcePath = path.join(configDir, file.source);
    const targetPath = path.join(projectDir, file.target);

    if (!(await fs.pathExists(sourcePath))) {
      continue;
    }

    await fs.ensureDir(path.dirname(targetPath));
    let content = await fs.readFile(sourcePath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replaceAll(key, value);
    }
    await fs.writeFile(targetPath, content, 'utf-8');
    logger.debug(`Created ${file.target}`);
  }
}
