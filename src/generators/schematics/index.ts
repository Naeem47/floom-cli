import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { logger } from '../../utils/logger';
import {
  detectProjectContext,
  featureRoot,
} from '../../utils/project-context';
import { toPascalCase, toSnakeCase } from '../../utils/paths';
import {
  blocPageTemplate,
  cubitTemplate,
  entityTemplate,
  mvcBlocViewTemplate,
  mvcCubitTemplate,
  mvcNoneViewTemplate,
  mvcProviderNotifierTemplate,
  mvcProviderViewTemplate,
  mvcRiverpodViewTemplate,
  modelTemplate,
  nonePageTemplate,
  providerNotifierTemplate,
  providerPageTemplate,
  repositoryImplBody,
  repositoryTemplate,
  riverpodPageTemplate,
  riverpodProviderTemplate,
  mvcRiverpodProviderTemplate,
  serviceTemplate,
} from './templates';

export interface SchematicOptions {
  name: string;
  projectDir?: string;
  feature?: string;
}

async function writeFile(
  projectDir: string,
  relativePath: string,
  content: string
): Promise<void> {
  const filePath = path.join(projectDir, relativePath);
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
  logger.debug(`Created ${relativePath}`);
}

export async function generateRepository(
  options: SchematicOptions
): Promise<void> {
  const projectDir = options.projectDir ?? process.cwd();
  const ctx = await detectProjectContext(projectDir);
  const nameSnake = toSnakeCase(options.name);
  const namePascal = toPascalCase(options.name);
  const featureSnake = toSnakeCase(options.feature ?? options.name);

  if (!(await fs.pathExists(featureRoot(ctx, featureSnake)))) {
    throw new Error(
      `Feature "${featureSnake}" not found. Run: floom g module ${featureSnake}`
    );
  }

  const spinner = ora(`Generating repository "${nameSnake}"...`).start();

  try {
    if (ctx.architecture === 'feature-first') {
      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/repositories/${nameSnake}_repository.dart`,
        repositoryTemplate(namePascal, nameSnake, '../models/')
      );
      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/repositories/${nameSnake}_repository_impl.dart`,
        repositoryImplBody(ctx, namePascal, nameSnake, 'feature-first')
      );
    } else {
      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/domain/entities/${nameSnake}_entity.dart`,
        entityTemplate(namePascal)
      );
      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/domain/repositories/${nameSnake}_repository.dart`,
        repositoryTemplate(namePascal, nameSnake, '../')
      );
      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/data/models/${nameSnake}_model.dart`,
        modelTemplate(namePascal, nameSnake)
      );
      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/data/repositories/${nameSnake}_repository_impl.dart`,
        repositoryImplBody(ctx, namePascal, nameSnake, 'clean')
      );
    }

    spinner.succeed(`Repository "${nameSnake}" created with API call template`);
  } catch (error) {
    spinner.fail('Failed to generate repository');
    throw error;
  }
}

export async function generateProvider(
  options: SchematicOptions
): Promise<void> {
  const projectDir = options.projectDir ?? process.cwd();
  const ctx = await detectProjectContext(projectDir);

  if (ctx.state !== 'riverpod' && ctx.state !== 'provider') {
    throw new Error(
      'Provider schematic requires flutter_riverpod or provider in pubspec.yaml'
    );
  }

  const nameSnake = toSnakeCase(options.name);
  const namePascal = toPascalCase(options.name);
  const featureSnake = toSnakeCase(options.feature ?? options.name);

  const spinner = ora(`Generating provider "${nameSnake}"...`).start();
  try {
    if (ctx.architecture === 'mvc') {
      if (ctx.state === 'riverpod') {
        await writeFile(
          projectDir,
          `lib/features/${featureSnake}/providers/${nameSnake}_provider.dart`,
          mvcRiverpodProviderTemplate(namePascal, nameSnake)
        );
      } else {
        await writeFile(
          projectDir,
          `lib/features/${featureSnake}/providers/${nameSnake}_notifier.dart`,
          mvcProviderNotifierTemplate(namePascal, nameSnake)
        );
      }
    } else {
      const architecture = ctx.architecture === 'feature-first' ? 'feature-first' : 'clean';
      const repoImport =
        architecture === 'feature-first'
          ? `../repositories/${nameSnake}_repository_impl.dart`
          : `../../data/repositories/${nameSnake}_repository_impl.dart`;
      const providerDir =
        architecture === 'feature-first' ? 'providers' : 'presentation/providers';
      const fileName =
        ctx.state === 'riverpod' ? `${nameSnake}_provider.dart` : `${nameSnake}_notifier.dart`;
      const content =
        ctx.state === 'riverpod'
          ? riverpodProviderTemplate(namePascal, nameSnake, repoImport, architecture)
          : providerNotifierTemplate(namePascal, nameSnake, repoImport, architecture);

      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/${providerDir}/${fileName}`,
        content
      );
    }

    spinner.succeed(`Provider "${nameSnake}" created (${ctx.state})`);
  } catch (error) {
    spinner.fail('Failed to generate provider');
    throw error;
  }
}

export async function generateCubit(options: SchematicOptions): Promise<void> {
  const projectDir = options.projectDir ?? process.cwd();
  const ctx = await detectProjectContext(projectDir);

  if (ctx.state !== 'bloc') {
    throw new Error('Cubit schematic requires flutter_bloc in pubspec.yaml');
  }

  const nameSnake = toSnakeCase(options.name);
  const namePascal = toPascalCase(options.name);
  const featureSnake = toSnakeCase(options.feature ?? options.name);

  const spinner = ora(`Generating cubit "${nameSnake}"...`).start();
  try {
    if (ctx.architecture === 'mvc') {
      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/cubit/${nameSnake}_cubit.dart`,
        mvcCubitTemplate(namePascal, nameSnake)
      );
    } else {
      const architecture = ctx.architecture === 'feature-first' ? 'feature-first' : 'clean';
      const repoImport =
        architecture === 'feature-first'
          ? `../repositories/${nameSnake}_repository_impl.dart`
          : `../../data/repositories/${nameSnake}_repository_impl.dart`;
      const cubitDir =
        architecture === 'feature-first' ? 'cubit' : 'presentation/cubit';

      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/${cubitDir}/${nameSnake}_cubit.dart`,
        cubitTemplate(namePascal, nameSnake, repoImport, architecture)
      );
    }

    spinner.succeed(`Cubit "${nameSnake}" created`);
  } catch (error) {
    spinner.fail('Failed to generate cubit');
    throw error;
  }
}

export async function generatePage(options: SchematicOptions): Promise<void> {
  const projectDir = options.projectDir ?? process.cwd();
  const ctx = await detectProjectContext(projectDir);
  const nameSnake = toSnakeCase(options.name);
  const namePascal = toPascalCase(options.name);
  const featureSnake = toSnakeCase(options.feature ?? options.name);

  const spinner = ora(`Generating page "${nameSnake}"...`).start();

  try {
    if (ctx.architecture === 'minimal') {
      await writeFile(
        projectDir,
        `lib/pages/${nameSnake}_page.dart`,
        `import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ${namePascal}Page extends StatelessWidget {
  const ${namePascal}Page({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${namePascal}', style: TextStyle(fontSize: 18.sp))),
      body: const Center(child: Text('${namePascal}')),
    );
  }
}
`
      );
    } else if (ctx.architecture === 'mvc') {
      let content: string;
      switch (ctx.state) {
        case 'riverpod':
          content = mvcRiverpodViewTemplate(namePascal, nameSnake);
          break;
        case 'bloc':
          content = mvcBlocViewTemplate(namePascal, nameSnake);
          break;
        case 'provider':
          content = mvcProviderViewTemplate(namePascal, nameSnake);
          break;
        default:
          content = mvcNoneViewTemplate(namePascal, nameSnake);
      }

      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/views/${nameSnake}_view.dart`,
        content
      );
    } else {
      const architecture = ctx.architecture === 'feature-first' ? 'feature-first' : 'clean';
      const pageDir =
        architecture === 'feature-first' ? 'pages' : 'presentation/pages';

      let content: string;
      switch (ctx.state) {
        case 'riverpod':
          content = riverpodPageTemplate(namePascal, nameSnake, architecture);
          break;
        case 'bloc':
          content = blocPageTemplate(namePascal, nameSnake, architecture);
          break;
        case 'provider':
          content = providerPageTemplate(namePascal, nameSnake, architecture);
          break;
        default:
          content = nonePageTemplate(namePascal, nameSnake, architecture);
      }

      await writeFile(
        projectDir,
        `lib/features/${featureSnake}/${pageDir}/${nameSnake}_page.dart`,
        content
      );
    }

    spinner.succeed(`Page "${nameSnake}" created (${ctx.state})`);
  } catch (error) {
    spinner.fail('Failed to generate page');
    throw error;
  }
}

export async function generateService(options: SchematicOptions): Promise<void> {
  const projectDir = options.projectDir ?? process.cwd();
  const ctx = await detectProjectContext(projectDir);

  if (!ctx.hasApiService) {
    throw new Error(
      'Service schematic requires ApiService (create project with dio/http)'
    );
  }

  const nameSnake = toSnakeCase(options.name);
  const namePascal = toPascalCase(options.name);
  const spinner = ora(`Generating service "${nameSnake}"...`).start();

  try {
    await writeFile(
      projectDir,
      `lib/core/network/services/${nameSnake}_service.dart`,
      serviceTemplate(namePascal, nameSnake)
    );
    spinner.succeed(`Service "${nameSnake}" created at lib/core/network/services/`);
  } catch (error) {
    spinner.fail('Failed to generate service');
    throw error;
  }
}

export { generateModule } from './module';
