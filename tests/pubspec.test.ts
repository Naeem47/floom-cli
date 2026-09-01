import { describe, expect, it } from 'vitest';
import {
  hasPubspecDependency,
  injectDependencies,
  injectFlutterAssets,
} from '../src/utils/pubspec';

const samplePubspec = `name: my_app
description: "A new Flutter project."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: ^3.5.4

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`;

describe('pubspec utils', () => {
  it('does not treat studio comment as dio dependency', () => {
    expect(hasPubspecDependency(samplePubspec, 'dio')).toBe(false);
  });

  it('injects dio even when studio appears in comments', () => {
    const updated = injectDependencies(samplePubspec, 'dependencies', {
      dio: '^5.7.0',
      provider: '^6.1.2',
    });

    expect(updated).toContain('  dio: ^5.7.0');
    expect(updated).toContain('  provider: ^6.1.2');
  });

  it('adds flutter assets block', () => {
    const updated = injectFlutterAssets(samplePubspec, [
      'assets/images/',
      'assets/icons/',
    ]);

    expect(updated).toContain('  assets:');
    expect(updated).toContain('    - assets/images/');
    expect(updated).toContain('    - assets/icons/');
  });
});
