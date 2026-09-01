import path from 'path';
import fs from 'fs-extra';

export function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function toPascalCase(value: string): string {
  return value
    .replace(/[_\s-]+(.)?/g, (_, char: string) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase());
}

export function toPackageName(org: string, projectName: string): string {
  const snake = toSnakeCase(projectName);
  return `${org}.${snake}`;
}

export function getTemplatesDir(): string {
  return path.resolve(__dirname, '../../templates');
}

export function getFlutterTemplatesDir(): string {
  return path.join(getTemplatesDir(), 'flutter');
}

/** @deprecated Use getLayerDir from templates/registry */
export function getTemplatePath(templateName: string): string {
  return path.join(getFlutterTemplatesDir(), templateName);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function pathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

export function resolveProjectDir(name: string, outputDir?: string): string {
  return path.resolve(outputDir ?? process.cwd(), name);
}
