import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import type { GenerateModuleOptions } from '../../types';
import type { ProjectContext } from '../../utils/project-context';
import { logger } from '../../utils/logger';
import { detectProjectContext, featureRoot } from '../../utils/project-context';
import { toPascalCase, toSnakeCase } from '../../utils/paths';
import {
  blocPageTemplate,
  cubitTemplate,
  entityTemplate,
  modelTemplate,
  mvcBlocViewTemplate,
  mvcCubitTemplate,
  mvcNoneViewTemplate,
  mvcProviderNotifierTemplate,
  mvcProviderViewTemplate,
  mvcRiverpodProviderTemplate,
  mvcRiverpodViewTemplate,
  nonePageTemplate,
  providerNotifierTemplate,
  providerPageTemplate,
  repositoryImplBody,
  repositoryTemplate,
  riverpodPageTemplate,
  riverpodProviderTemplate,
} from './templates';

interface GeneratedFile {
  relativePath: string;
  content: string;
}

type ModuleArchitecture = 'clean' | 'feature-first';

export async function generateModule(
  options: GenerateModuleOptions
): Promise<void> {
  const { name, projectDir = process.cwd(), withTests = true } = options;
  const ctx = await detectProjectContext(projectDir);
  const featureSnake = toSnakeCase(name);
  const featurePascal = toPascalCase(name);

  if (await fs.pathExists(featureRoot(ctx, featureSnake))) {
    throw new Error(`Module "${featureSnake}" already exists`);
  }

  const spinner = ora(`Generating module "${featureSnake}"...`).start();

  try {
    const files = buildModuleFiles(ctx, featureSnake, featurePascal, withTests);

    for (const file of files) {
      const filePath = path.join(projectDir, file.relativePath);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content, 'utf-8');
      logger.debug(`Created ${file.relativePath}`);
    }

    spinner.succeed(`Module "${featureSnake}" created (${ctx.architecture})`);
    logger.info(`  lib/features/${featureSnake}/`);
    logger.info(`  State: ${ctx.state} · API: ${ctx.hasApiService ? 'yes' : 'no'}`);
  } catch (error) {
    spinner.fail('Failed to generate module');
    throw error;
  }
}

function buildModuleFiles(
  ctx: ProjectContext,
  featureSnake: string,
  featurePascal: string,
  withTests: boolean
): GeneratedFile[] {
  switch (ctx.architecture) {
    case 'feature-first':
      return buildFeatureFirstModule(ctx, featureSnake, featurePascal, withTests);
    case 'mvc':
      return buildMvcModule(ctx, featureSnake, featurePascal);
    case 'minimal':
      throw new Error(
        'Minimal projects use pages/ — use: floom g page <name>'
      );
    default:
      return buildCleanModule(ctx, featureSnake, featurePascal, withTests);
  }
}

function appendPresentationFiles(
  ctx: ProjectContext,
  files: GeneratedFile[],
  featureSnake: string,
  featurePascal: string,
  architecture: ModuleArchitecture
): void {
  const repoImport =
    architecture === 'clean'
      ? `../../data/repositories/${featureSnake}_repository_impl.dart`
      : `../repositories/${featureSnake}_repository_impl.dart`;

  const providerDir = architecture === 'clean' ? 'presentation/providers' : 'providers';
  const cubitDir = architecture === 'clean' ? 'presentation/cubit' : 'cubit';
  const pageDir = architecture === 'clean' ? 'presentation/pages' : 'pages';

  switch (ctx.state) {
    case 'riverpod':
      files.push(
        {
          relativePath: `lib/features/${featureSnake}/${providerDir}/${featureSnake}_provider.dart`,
          content: riverpodProviderTemplate(
            featurePascal,
            featureSnake,
            repoImport,
            architecture
          ),
        },
        {
          relativePath: `lib/features/${featureSnake}/${pageDir}/${featureSnake}_page.dart`,
          content: riverpodPageTemplate(featurePascal, featureSnake, architecture),
        }
      );
      break;
    case 'bloc':
      files.push(
        {
          relativePath: `lib/features/${featureSnake}/${cubitDir}/${featureSnake}_cubit.dart`,
          content: cubitTemplate(featurePascal, featureSnake, repoImport, architecture),
        },
        {
          relativePath: `lib/features/${featureSnake}/${pageDir}/${featureSnake}_page.dart`,
          content: blocPageTemplate(featurePascal, featureSnake, architecture),
        }
      );
      break;
    case 'provider':
      files.push(
        {
          relativePath: `lib/features/${featureSnake}/${providerDir}/${featureSnake}_notifier.dart`,
          content: providerNotifierTemplate(
            featurePascal,
            featureSnake,
            repoImport,
            architecture
          ),
        },
        {
          relativePath: `lib/features/${featureSnake}/${pageDir}/${featureSnake}_page.dart`,
          content: providerPageTemplate(featurePascal, featureSnake, architecture),
        }
      );
      break;
    default:
      files.push({
        relativePath: `lib/features/${featureSnake}/${pageDir}/${featureSnake}_page.dart`,
        content: nonePageTemplate(featurePascal, featureSnake, architecture),
      });
  }
}

function buildCleanModule(
  ctx: ProjectContext,
  featureSnake: string,
  featurePascal: string,
  withTests: boolean
): GeneratedFile[] {
  const files: GeneratedFile[] = [
    {
      relativePath: `lib/features/${featureSnake}/domain/entities/${featureSnake}_entity.dart`,
      content: entityTemplate(featurePascal),
    },
    {
      relativePath: `lib/features/${featureSnake}/domain/repositories/${featureSnake}_repository.dart`,
      content: repositoryTemplate(featurePascal, featureSnake, '../'),
    },
    {
      relativePath: `lib/features/${featureSnake}/data/models/${featureSnake}_model.dart`,
      content: modelTemplate(featurePascal, featureSnake),
    },
    {
      relativePath: `lib/features/${featureSnake}/data/repositories/${featureSnake}_repository_impl.dart`,
      content: repositoryImplBody(ctx, featurePascal, featureSnake, 'clean'),
    },
  ];

  appendPresentationFiles(ctx, files, featureSnake, featurePascal, 'clean');

  if (withTests) {
    files.push({
      relativePath: `test/features/${featureSnake}/${featureSnake}_test.dart`,
      content: `void main() {}\n`,
    });
  }

  return files;
}

function buildFeatureFirstModule(
  ctx: ProjectContext,
  featureSnake: string,
  featurePascal: string,
  withTests: boolean
): GeneratedFile[] {
  const files: GeneratedFile[] = [
    {
      relativePath: `lib/features/${featureSnake}/models/${featureSnake}_entity.dart`,
      content: entityTemplate(featurePascal),
    },
    {
      relativePath: `lib/features/${featureSnake}/repositories/${featureSnake}_repository.dart`,
      content: repositoryTemplate(featurePascal, featureSnake, '../models/'),
    },
    {
      relativePath: `lib/features/${featureSnake}/repositories/${featureSnake}_repository_impl.dart`,
      content: repositoryImplBody(ctx, featurePascal, featureSnake, 'feature-first'),
    },
  ];

  appendPresentationFiles(ctx, files, featureSnake, featurePascal, 'feature-first');

  if (withTests) {
    files.push({
      relativePath: `test/features/${featureSnake}/${featureSnake}_test.dart`,
      content: `void main() {}\n`,
    });
  }

  return files;
}

function buildMvcModule(
  ctx: ProjectContext,
  featureSnake: string,
  featurePascal: string
): GeneratedFile[] {
  const controllerBody = ctx.hasApiService
    ? `import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_service.dart';
import '../../../../core/network/dio_api_service.dart';
import '../models/${featureSnake}_model.dart';

class ${featurePascal}Controller {
  ${featurePascal}Controller({ApiService? apiService})
      : _apiService = apiService ?? ApiServiceLocator.instance;

  final ApiService _apiService;

  Future<${featurePascal}Model> load() async {
    try {
      final data = await _apiService.get(
        ApiEndpoints.resource('${featureSnake.replace(/_/g, '-')}'),
      );
      return ${featurePascal}Model(id: data['id'] as String);
    } catch (error) {
      throw Exception('Failed to load ${featureSnake}: \$error');
    }
  }
}
`
    : `import '../models/${featureSnake}_model.dart';

class ${featurePascal}Controller {
  Future<${featurePascal}Model> load() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    return const ${featurePascal}Model(id: 'local');
  }
}
`;

  const files: GeneratedFile[] = [
    {
      relativePath: `lib/features/${featureSnake}/models/${featureSnake}_model.dart`,
      content: `class ${featurePascal}Model {
  const ${featurePascal}Model({required this.id});

  final String id;
}
`,
    },
    {
      relativePath: `lib/features/${featureSnake}/controllers/${featureSnake}_controller.dart`,
      content: controllerBody,
    },
  ];

  switch (ctx.state) {
    case 'riverpod':
      files.push(
        {
          relativePath: `lib/features/${featureSnake}/providers/${featureSnake}_provider.dart`,
          content: mvcRiverpodProviderTemplate(featurePascal, featureSnake),
        },
        {
          relativePath: `lib/features/${featureSnake}/views/${featureSnake}_view.dart`,
          content: mvcRiverpodViewTemplate(featurePascal, featureSnake),
        }
      );
      break;
    case 'bloc':
      files.push(
        {
          relativePath: `lib/features/${featureSnake}/cubit/${featureSnake}_cubit.dart`,
          content: mvcCubitTemplate(featurePascal, featureSnake),
        },
        {
          relativePath: `lib/features/${featureSnake}/views/${featureSnake}_view.dart`,
          content: mvcBlocViewTemplate(featurePascal, featureSnake),
        }
      );
      break;
    case 'provider':
      files.push(
        {
          relativePath: `lib/features/${featureSnake}/providers/${featureSnake}_notifier.dart`,
          content: mvcProviderNotifierTemplate(featurePascal, featureSnake),
        },
        {
          relativePath: `lib/features/${featureSnake}/views/${featureSnake}_view.dart`,
          content: mvcProviderViewTemplate(featurePascal, featureSnake),
        }
      );
      break;
    default:
      files.push({
        relativePath: `lib/features/${featureSnake}/views/${featureSnake}_view.dart`,
        content: mvcNoneViewTemplate(featurePascal, featureSnake),
      });
  }

  return files;
}
