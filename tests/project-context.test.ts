import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { detectProjectContext } from '../src/utils/project-context';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => fs.remove(dir)));
  tempDirs.length = 0;
});

async function createProject(structure: {
  pubspec: string;
  files?: Record<string, string>;
}): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'floom-detect-'));
  tempDirs.push(dir);

  await fs.writeFile(path.join(dir, 'pubspec.yaml'), structure.pubspec, 'utf-8');

  for (const [relativePath, content] of Object.entries(structure.files ?? {})) {
    const filePath = path.join(dir, relativePath);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  }

  return dir;
}

describe('detectProjectContext state', () => {
  it('detects provider from pubspec', async () => {
    const dir = await createProject({
      pubspec: `
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
`,
      files: {
        'lib/features/home/presentation/pages/home_page.dart': '// page',
        'lib/features/home/domain/entities/home_entity.dart': '// entity',
      },
    });

    const ctx = await detectProjectContext(dir);
    expect(ctx.state).toBe('provider');
  });

  it('detects provider from home notifier file', async () => {
    const dir = await createProject({
      pubspec: `
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
`,
      files: {
        'lib/features/home/presentation/providers/home_notifier.dart': `
import 'package:flutter/foundation.dart';

class HomeNotifier extends ChangeNotifier {}
`,
        'lib/features/home/domain/entities/home_entity.dart': '// entity',
      },
    });

    const ctx = await detectProjectContext(dir);
    expect(ctx.state).toBe('provider');
  });

  it('detects bloc from cubit file', async () => {
    const dir = await createProject({
      pubspec: `
dependencies:
  flutter:
    sdk: flutter
  flutter_bloc: ^8.1.6
`,
      files: {
        'lib/features/home/presentation/cubit/home_cubit.dart': '// cubit',
        'lib/features/home/domain/entities/home_entity.dart': '// entity',
      },
    });

    const ctx = await detectProjectContext(dir);
    expect(ctx.state).toBe('bloc');
  });

  it('detects riverpod from home provider file', async () => {
    const dir = await createProject({
      pubspec: `
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.6.1
`,
      files: {
        'lib/features/home/presentation/providers/home_provider.dart': `
import 'package:flutter_riverpod/flutter_riverpod.dart';
`,
        'lib/features/home/domain/entities/home_entity.dart': '// entity',
      },
    });

    const ctx = await detectProjectContext(dir);
    expect(ctx.state).toBe('riverpod');
  });
});

describe('provider module templates', () => {
  it('uses ChangeNotifier instead of Riverpod for provider projects', async () => {
    const { providerNotifierTemplate, providerPageTemplate } = await import(
      '../src/generators/schematics/templates'
    );

    const notifier = providerNotifierTemplate(
      'Profile',
      'profile',
      '../../data/repositories/profile_repository_impl.dart',
      'clean'
    );
    const page = providerPageTemplate('Profile', 'profile', 'clean');

    expect(notifier).toContain('ChangeNotifier');
    expect(notifier).not.toContain('flutter_riverpod');
    expect(page).toContain('package:provider/provider.dart');
    expect(page).toContain('ChangeNotifierProvider');
    expect(page).not.toContain('ConsumerWidget');
  });
});
