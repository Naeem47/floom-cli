import fs from 'fs-extra';
import path from 'path';
import type { TemplateContext, TemplateSelection } from '../types';
import { logger } from '../utils/logger';

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

function renderContent(content: string, context: TemplateContext): string {
  return content.replace(PLACEHOLDER_REGEX, (_, key: string) => {
    const value = context[key as keyof TemplateContext];
    return value ?? '';
  });
}

function renderFileName(fileName: string, context: TemplateContext): string {
  return renderContent(fileName, context);
}

export async function copyTemplate(
  templateDir: string,
  targetDir: string,
  context: TemplateContext
): Promise<void> {
  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`Template not found: ${templateDir}`);
  }

  await fs.ensureDir(targetDir);
  await copyDirectory(templateDir, targetDir, context);
}

async function copyDirectory(
  sourceDir: string,
  targetDir: string,
  context: TemplateContext
): Promise<void> {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetName = renderFileName(entry.name, context);
    const targetPath = path.join(targetDir, targetName);

    if (entry.isDirectory()) {
      await fs.ensureDir(targetPath);
      await copyDirectory(sourcePath, targetPath, context);
      continue;
    }

    const content = await fs.readFile(sourcePath, 'utf-8');
    const rendered = renderContent(content, context);
    await fs.writeFile(targetPath, rendered, 'utf-8');
    logger.debug(`Created ${targetPath}`);
  }
}

function buildBaseContext(
  projectName: string,
  org: string
): Pick<
  TemplateContext,
  'projectName' | 'projectNameSnake' | 'projectNamePascal' | 'org' | 'packageName'
> {
  const projectNameSnake = projectName
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();

  const projectNamePascal = projectNameSnake
    .replace(/[_\s-]+(.)?/g, (_, char: string) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase());

  return {
    projectName,
    projectNameSnake,
    projectNamePascal,
    org,
    packageName: `${org}.${projectNameSnake}`,
  };
}

export function buildTemplateContext(
  projectName: string,
  org: string,
  selection: TemplateSelection
): TemplateContext {
  return {
    ...buildBaseContext(projectName, org),
    ...selection,
    designMobileWidth: '375',
    designMobileHeight: '812',
    designTabletWidth: '768',
    designTabletHeight: '1024',
    designDesktopWidth: '1440',
    designDesktopHeight: '900',
    primaryDesignWidth: '375',
    primaryDesignHeight: '812',
    includeMobile: 'true',
    includeTablet: 'true',
    includeDesktop: 'true',
    includeAssets: 'true',
    includeFirebase: 'false',
    includeFirebaseAuth: 'false',
    includeFirebaseFirestore: 'false',
    includeFirebaseMessaging: 'false',
    includeFirebaseStorage: 'false',
    includeFirebaseAnalytics: 'false',
  };
}

/** @deprecated Use buildTemplateContext with a TemplateSelection */
export function buildLegacyTemplateContext(
  projectName: string,
  org: string
): Pick<
  TemplateContext,
  'projectName' | 'projectNameSnake' | 'projectNamePascal' | 'org' | 'packageName'
> {
  return buildBaseContext(projectName, org);
}
