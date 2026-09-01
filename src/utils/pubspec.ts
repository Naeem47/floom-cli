const DEPENDENCY_KEY_REGEX = (pkg: string) =>
  new RegExp(`^\\s{2}${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:`, 'm');

export function hasPubspecDependency(pubspec: string, pkg: string): boolean {
  return DEPENDENCY_KEY_REGEX(pkg).test(pubspec);
}

export function injectDependencies(
  pubspec: string,
  section: 'dependencies' | 'dev_dependencies',
  deps: Record<string, string>
): string {
  const lines = Object.entries(deps).filter(
    ([pkg]) => !hasPubspecDependency(pubspec, pkg)
  );

  if (lines.length === 0) {
    return pubspec;
  }

  const formatted = lines.map(([pkg, version]) => `  ${pkg}: ${version}`);
  const sectionRegex = new RegExp(`^${section}:\\s*$`, 'm');

  if (!sectionRegex.test(pubspec)) {
    return `${pubspec}\n${section}:\n${formatted.join('\n')}\n`;
  }

  return pubspec.replace(sectionRegex, (match) => `${match}\n${formatted.join('\n')}`);
}

export function injectFlutterAssets(
  pubspec: string,
  assetPaths: string[]
): string {
  if (assetPaths.length === 0) {
    return pubspec;
  }

  const flutterSectionRegex = /^flutter:\s*$/m;
  if (!flutterSectionRegex.test(pubspec)) {
    return pubspec;
  }

  const missing = assetPaths.filter(
    (assetPath) => !pubspec.includes(`- ${assetPath}`)
  );

  if (missing.length === 0) {
    return pubspec;
  }

  const assetsBlock = missing.map((assetPath) => `    - ${assetPath}`).join('\n');

  if (/^\s{2}assets:\s*$/m.test(pubspec)) {
    return pubspec.replace(/^(\s{2}assets:\s*)$/m, `$1\n${assetsBlock}`);
  }

  return pubspec.replace(
    flutterSectionRegex,
    (match) => `${match}\n  assets:\n${assetsBlock}`
  );
}
