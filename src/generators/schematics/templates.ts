import type { ProjectContext } from '../../utils/project-context';

type ModuleArchitecture = 'clean' | 'feature-first';

export function repositoryImplBody(
  ctx: ProjectContext,
  featurePascal: string,
  featureSnake: string,
  architecture: ModuleArchitecture
): string {
  const endpoint = `ApiEndpoints.resource('${featureSnake.replace(/_/g, '-')}')`;

  if (ctx.hasApiService) {
    const apiImport =
      ctx.hasHttp && !ctx.hasDio
        ? "import '../../../../core/network/http_api_service.dart';"
        : "import '../../../../core/network/dio_api_service.dart';";

    const modelImport =
      architecture === 'clean'
        ? `import '../models/${featureSnake}_model.dart';`
        : '';

    const parseBody =
      architecture === 'clean'
        ? `return ${featurePascal}Model.fromJson(data).toEntity();`
        : `return ${featurePascal}Entity(id: data['id'] as String);`;

    const entityImport =
      architecture === 'clean'
        ? `import '../../domain/entities/${featureSnake}_entity.dart';
import '../../domain/repositories/${featureSnake}_repository.dart';`
        : `import '../models/${featureSnake}_entity.dart';
import '../repositories/${featureSnake}_repository.dart';`;

    return `${entityImport}
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_service.dart';
${apiImport}
${modelImport}

class ${featurePascal}RepositoryImpl implements ${featurePascal}Repository {
  ${featurePascal}RepositoryImpl({ApiService? apiService})
      : _apiService = apiService ?? ApiServiceLocator.instance;

  final ApiService _apiService;

  @override
  Future<${featurePascal}Entity> fetch() async {
    try {
      final data = await _apiService.get(${endpoint});
      ${parseBody}
    } catch (error) {
      throw Exception('Failed to fetch ${featureSnake}: \$error');
    }
  }
}
`;
  }

  const entityImport =
    architecture === 'clean'
      ? `import '../../domain/entities/${featureSnake}_entity.dart';
import '../../domain/repositories/${featureSnake}_repository.dart';`
      : `import '../models/${featureSnake}_entity.dart';
import '../repositories/${featureSnake}_repository.dart';`;

  return `${entityImport}

class ${featurePascal}RepositoryImpl implements ${featurePascal}Repository {
  @override
  Future<${featurePascal}Entity> fetch() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    throw UnimplementedError('Add dio/http layer or implement local data source');
  }
}
`;
}

export function entityTemplate(featurePascal: string): string {
  return `class ${featurePascal}Entity {
  const ${featurePascal}Entity({
    required this.id,
  });

  final String id;
}
`;
}

export function repositoryTemplate(
  featurePascal: string,
  featureSnake: string,
  importPrefix: string
): string {
  return `import '${importPrefix}entities/${featureSnake}_entity.dart';

abstract class ${featurePascal}Repository {
  Future<${featurePascal}Entity> fetch();
}
`;
}

export function modelTemplate(featurePascal: string, featureSnake: string): string {
  return `import '../../domain/entities/${featureSnake}_entity.dart';

class ${featurePascal}Model {
  const ${featurePascal}Model({required this.id});

  final String id;

  factory ${featurePascal}Model.fromJson(Map<String, dynamic> json) {
    return ${featurePascal}Model(id: json['id'] as String);
  }

  Map<String, dynamic> toJson() => {'id': id};

  ${featurePascal}Entity toEntity() => ${featurePascal}Entity(id: id);
}
`;
}

function entityImportPath(
  architecture: ModuleArchitecture,
  featureSnake: string
): string {
  return architecture === 'clean'
    ? `../../domain/entities/${featureSnake}_entity.dart`
    : `../models/${featureSnake}_entity.dart`;
}

function repositoryImportPath(
  architecture: ModuleArchitecture,
  featureSnake: string
): string {
  return architecture === 'clean'
    ? `../../data/repositories/${featureSnake}_repository_impl.dart`
    : `../repositories/${featureSnake}_repository_impl.dart`;
}

function providerImportPath(
  architecture: ModuleArchitecture,
  featureSnake: string
): string {
  return architecture === 'clean'
    ? `../providers/${featureSnake}_provider.dart`
    : `../providers/${featureSnake}_provider.dart`;
}

function notifierImportPath(
  architecture: ModuleArchitecture,
  featureSnake: string
): string {
  return architecture === 'clean'
    ? `../providers/${featureSnake}_notifier.dart`
    : `../providers/${featureSnake}_notifier.dart`;
}

function cubitImportPath(
  architecture: ModuleArchitecture,
  featureSnake: string
): string {
  return architecture === 'clean'
    ? `../cubit/${featureSnake}_cubit.dart`
    : `../cubit/${featureSnake}_cubit.dart`;
}

export function riverpodProviderTemplate(
  featurePascal: string,
  featureSnake: string,
  repositoryImport: string,
  architecture: ModuleArchitecture = 'clean'
): string {
  const entityImport = entityImportPath(architecture, featureSnake);
  const repositoryInterfaceImport =
    architecture === 'clean'
      ? `import '../../domain/repositories/${featureSnake}_repository.dart';`
      : `import '../repositories/${featureSnake}_repository.dart';`;

  return `import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import ${repositoryImport};
import ${entityImport};
${repositoryInterfaceImport}

final ${featureSnake}RepositoryProvider = Provider<${featurePascal}Repository>((ref) {
  return ${featurePascal}RepositoryImpl();
});

class ${featurePascal}Notifier extends Notifier<ApiResult<${featurePascal}Entity>> {
  @override
  ApiResult<${featurePascal}Entity> build() {
    Future.microtask(load);
    return const ApiResult.initial();
  }

  Future<void> load() async {
    state = const ApiResult.loading();
    try {
      final entity = await ref.read(${featureSnake}RepositoryProvider).fetch();
      state = ApiResult.success(entity);
    } catch (error) {
      state = ApiResult.error(error.toString());
    }
  }
}

final ${featureSnake}Provider =
    NotifierProvider<${featurePascal}Notifier, ApiResult<${featurePascal}Entity>>(
  ${featurePascal}Notifier.new,
);
`;
}

export function riverpodPageTemplate(
  featurePascal: string,
  featureSnake: string,
  architecture: ModuleArchitecture = 'clean'
): string {
  const entityImport = entityImportPath(architecture, featureSnake);
  const providerImport = providerImportPath(architecture, featureSnake);

  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import ${entityImport};
import ${providerImport};

class ${featurePascal}Page extends ConsumerWidget {
  const ${featurePascal}Page({super.key});

  static const routeName = '/${featureSnake.replace(/_/g, '-')}';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(${featureSnake}Provider);

    return Scaffold(
      appBar: AppBar(
        title: Text('${featurePascal}', style: TextStyle(fontSize: 18.sp)),
      ),
      body: ApiStateBuilder<${featurePascal}Entity>(
        result: result,
        onSuccess: (data) => Center(
          child: Text(data.id, style: TextStyle(fontSize: 24.sp)),
        ),
      ),
    );
  }
}
`;
}

export function providerNotifierTemplate(
  featurePascal: string,
  featureSnake: string,
  repositoryImport: string,
  architecture: ModuleArchitecture = 'clean'
): string {
  const entityImport = entityImportPath(architecture, featureSnake);
  const repositoryInterfaceImport =
    architecture === 'clean'
      ? `import '../../domain/repositories/${featureSnake}_repository.dart';`
      : `import '../repositories/${featureSnake}_repository.dart';`;

  return `import 'package:flutter/foundation.dart';

import '../../../../core/network/api_result.dart';
import ${repositoryImport};
import ${entityImport};
${repositoryInterfaceImport}

class ${featurePascal}Notifier extends ChangeNotifier {
  ${featurePascal}Notifier(this._repository);

  final ${featurePascal}Repository _repository;

  ApiResult<${featurePascal}Entity> _result = const ApiResult.initial();

  ApiResult<${featurePascal}Entity> get result => _result;

  Future<void> load() async {
    _result = const ApiResult.loading();
    notifyListeners();

    try {
      final entity = await _repository.fetch();
      _result = ApiResult.success(entity);
    } catch (error) {
      _result = ApiResult.error(error.toString());
    }

    notifyListeners();
  }
}
`;
}

export function providerPageTemplate(
  featurePascal: string,
  featureSnake: string,
  architecture: ModuleArchitecture = 'clean'
): string {
  const entityImport = entityImportPath(architecture, featureSnake);
  const repositoryImport = repositoryImportPath(architecture, featureSnake);
  const notifierImport = notifierImportPath(architecture, featureSnake);

  return `import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import ${entityImport};
import ${repositoryImport};
import ${notifierImport};

class ${featurePascal}Page extends StatelessWidget {
  const ${featurePascal}Page({super.key});

  static const routeName = '/${featureSnake.replace(/_/g, '-')}';

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ${featurePascal}Notifier(${featurePascal}RepositoryImpl())..load(),
      child: const _${featurePascal}View(),
    );
  }
}

class _${featurePascal}View extends StatelessWidget {
  const _${featurePascal}View();

  @override
  Widget build(BuildContext context) {
    final result = context.watch<${featurePascal}Notifier>().result;

    return Scaffold(
      appBar: AppBar(
        title: Text('${featurePascal}', style: TextStyle(fontSize: 18.sp)),
      ),
      body: ApiStateBuilder<${featurePascal}Entity>(
        result: result,
        onSuccess: (data) => Center(
          child: Text(data.id, style: TextStyle(fontSize: 24.sp)),
        ),
      ),
    );
  }
}
`;
}

export function cubitTemplate(
  featurePascal: string,
  featureSnake: string,
  repositoryImport: string,
  architecture: ModuleArchitecture = 'clean'
): string {
  const entityImport = entityImportPath(architecture, featureSnake);
  const repositoryInterfaceImport =
    architecture === 'clean'
      ? `import '../../domain/repositories/${featureSnake}_repository.dart';`
      : `import '../repositories/${featureSnake}_repository.dart';`;

  return `import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_result.dart';
import ${entityImport};
${repositoryInterfaceImport}
import ${repositoryImport};

class ${featurePascal}Cubit extends Cubit<ApiResult<${featurePascal}Entity>> {
  ${featurePascal}Cubit(this._repository) : super(const ApiResult.initial());

  final ${featurePascal}Repository _repository;

  Future<void> load() async {
    emit(const ApiResult.loading());
    try {
      final entity = await _repository.fetch();
      emit(ApiResult.success(entity));
    } catch (error) {
      emit(ApiResult.error(error.toString()));
    }
  }
}
`;
}

export function blocPageTemplate(
  featurePascal: string,
  featureSnake: string,
  architecture: ModuleArchitecture = 'clean'
): string {
  const entityImport = entityImportPath(architecture, featureSnake);
  const repositoryImport = repositoryImportPath(architecture, featureSnake);
  const cubitImport = cubitImportPath(architecture, featureSnake);

  return `import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import ${entityImport};
import ${repositoryImport};
import ${cubitImport};

class ${featurePascal}Page extends StatelessWidget {
  const ${featurePascal}Page({super.key});

  static const routeName = '/${featureSnake.replace(/_/g, '-')}';

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ${featurePascal}Cubit(${featurePascal}RepositoryImpl())..load(),
      child: const _${featurePascal}View(),
    );
  }
}

class _${featurePascal}View extends StatelessWidget {
  const _${featurePascal}View();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${featurePascal}', style: TextStyle(fontSize: 18.sp)),
      ),
      body: BlocBuilder<${featurePascal}Cubit, ApiResult<${featurePascal}Entity>>(
        builder: (context, result) {
          return ApiStateBuilder<${featurePascal}Entity>(
            result: result,
            onSuccess: (data) => Center(
              child: Text(data.id, style: TextStyle(fontSize: 24.sp)),
            ),
          );
        },
      ),
    );
  }
}
`;
}

export function nonePageTemplate(
  featurePascal: string,
  featureSnake: string,
  architecture: ModuleArchitecture = 'clean'
): string {
  const entityImport = entityImportPath(architecture, featureSnake);
  const repositoryImport = repositoryImportPath(architecture, featureSnake);

  return `import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../core/network/api_result.dart';
import '../../../../shared/widgets/api_state_builder.dart';
import ${entityImport};
import ${repositoryImport};

class ${featurePascal}Page extends StatefulWidget {
  const ${featurePascal}Page({super.key});

  static const routeName = '/${featureSnake.replace(/_/g, '-')}';

  @override
  State<${featurePascal}Page> createState() => _${featurePascal}PageState();
}

class _${featurePascal}PageState extends State<${featurePascal}Page> {
  final _repository = ${featurePascal}RepositoryImpl();
  ApiResult<${featurePascal}Entity> _result = const ApiResult.initial();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _result = const ApiResult.loading());
    try {
      final entity = await _repository.fetch();
      setState(() => _result = ApiResult.success(entity));
    } catch (error) {
      setState(() => _result = ApiResult.error(error.toString()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${featurePascal}', style: TextStyle(fontSize: 18.sp)),
      ),
      body: ApiStateBuilder<${featurePascal}Entity>(
        result: _result,
        onSuccess: (data) => Center(
          child: Text(data.id, style: TextStyle(fontSize: 24.sp)),
        ),
      ),
    );
  }
}
`;
}

export function mvcRiverpodProviderTemplate(
  featurePascal: string,
  featureSnake: string
): string {
  return `import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import '../controllers/${featureSnake}_controller.dart';
import '../models/${featureSnake}_model.dart';

final ${featureSnake}ControllerProvider = Provider<${featurePascal}Controller>((ref) {
  return ${featurePascal}Controller();
});

class ${featurePascal}Notifier extends Notifier<ApiResult<${featurePascal}Model>> {
  @override
  ApiResult<${featurePascal}Model> build() {
    Future.microtask(load);
    return const ApiResult.initial();
  }

  Future<void> load() async {
    state = const ApiResult.loading();
    try {
      final model = await ref.read(${featureSnake}ControllerProvider).load();
      state = ApiResult.success(model);
    } catch (error) {
      state = ApiResult.error(error.toString());
    }
  }
}

final ${featureSnake}Provider =
    NotifierProvider<${featurePascal}Notifier, ApiResult<${featurePascal}Model>>(
  ${featurePascal}Notifier.new,
);
`;
}

export function mvcRiverpodViewTemplate(
  featurePascal: string,
  featureSnake: string
): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import '../models/${featureSnake}_model.dart';
import '../providers/${featureSnake}_provider.dart';

class ${featurePascal}View extends ConsumerWidget {
  const ${featurePascal}View({super.key});

  static const routeName = '/${featureSnake.replace(/_/g, '-')}';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(${featureSnake}Provider);

    return Scaffold(
      appBar: AppBar(
        title: Text('${featurePascal}', style: TextStyle(fontSize: 18.sp)),
      ),
      body: ApiStateBuilder<${featurePascal}Model>(
        result: result,
        onSuccess: (data) => Center(
          child: Text(data.id, style: TextStyle(fontSize: 24.sp)),
        ),
      ),
    );
  }
}
`;
}

export function mvcProviderNotifierTemplate(
  featurePascal: string,
  featureSnake: string
): string {
  return `import 'package:flutter/foundation.dart';

import '../../../../core/network/api_result.dart';
import '../controllers/${featureSnake}_controller.dart';
import '../models/${featureSnake}_model.dart';

class ${featurePascal}Notifier extends ChangeNotifier {
  ${featurePascal}Notifier(this._controller);

  final ${featurePascal}Controller _controller;

  ApiResult<${featurePascal}Model> _result = const ApiResult.initial();

  ApiResult<${featurePascal}Model> get result => _result;

  Future<void> load() async {
    _result = const ApiResult.loading();
    notifyListeners();

    try {
      final model = await _controller.load();
      _result = ApiResult.success(model);
    } catch (error) {
      _result = ApiResult.error(error.toString());
    }

    notifyListeners();
  }
}
`;
}

export function mvcProviderViewTemplate(
  featurePascal: string,
  featureSnake: string
): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import '../controllers/${featureSnake}_controller.dart';
import '../models/${featureSnake}_model.dart';
import '../providers/${featureSnake}_notifier.dart';

class ${featurePascal}View extends StatelessWidget {
  const ${featurePascal}View({super.key});

  static const routeName = '/${featureSnake.replace(/_/g, '-')}';

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ${featurePascal}Notifier(${featurePascal}Controller())..load(),
      child: Builder(
        builder: (context) {
          final result = context.watch<${featurePascal}Notifier>().result;

          return Scaffold(
            appBar: AppBar(
              title: Text('${featurePascal}', style: TextStyle(fontSize: 18.sp)),
            ),
            body: ApiStateBuilder<${featurePascal}Model>(
              result: result,
              onSuccess: (data) => Center(
                child: Text(data.id, style: TextStyle(fontSize: 24.sp)),
              ),
            ),
          );
        },
      ),
    );
  }
}
`;
}

export function mvcCubitTemplate(
  featurePascal: string,
  featureSnake: string
): string {
  return `import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_result.dart';
import '../controllers/${featureSnake}_controller.dart';
import '../models/${featureSnake}_model.dart';

class ${featurePascal}Cubit extends Cubit<ApiResult<${featurePascal}Model>> {
  ${featurePascal}Cubit(this._controller) : super(const ApiResult.initial());

  final ${featurePascal}Controller _controller;

  Future<void> load() async {
    emit(const ApiResult.loading());
    try {
      final model = await _controller.load();
      emit(ApiResult.success(model));
    } catch (error) {
      emit(ApiResult.error(error.toString()));
    }
  }
}
`;
}

export function mvcBlocViewTemplate(
  featurePascal: string,
  featureSnake: string
): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import '../controllers/${featureSnake}_controller.dart';
import '../cubit/${featureSnake}_cubit.dart';
import '../models/${featureSnake}_model.dart';

class ${featurePascal}View extends StatelessWidget {
  const ${featurePascal}View({super.key});

  static const routeName = '/${featureSnake.replace(/_/g, '-')}';

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ${featurePascal}Cubit(${featurePascal}Controller())..load(),
      child: Scaffold(
        appBar: AppBar(
          title: Text('${featurePascal}', style: TextStyle(fontSize: 18.sp)),
        ),
        body: BlocBuilder<${featurePascal}Cubit, ApiResult<${featurePascal}Model>>(
          builder: (context, result) {
            return ApiStateBuilder<${featurePascal}Model>(
              result: result,
              onSuccess: (data) => Center(
                child: Text(data.id, style: TextStyle(fontSize: 24.sp)),
              ),
            );
          },
        ),
      ),
    );
  }
}
`;
}

export function mvcNoneViewTemplate(
  featurePascal: string,
  featureSnake: string
): string {
  return `import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../core/network/api_result.dart';
import '../../../../shared/widgets/api_state_builder.dart';
import '../controllers/${featureSnake}_controller.dart';
import '../models/${featureSnake}_model.dart';

class ${featurePascal}View extends StatefulWidget {
  const ${featurePascal}View({super.key});

  static const routeName = '/${featureSnake.replace(/_/g, '-')}';

  @override
  State<${featurePascal}View> createState() => _${featurePascal}ViewState();
}

class _${featurePascal}ViewState extends State<${featurePascal}View> {
  final _controller = ${featurePascal}Controller();
  ApiResult<${featurePascal}Model> _result = const ApiResult.initial();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _result = const ApiResult.loading());
    try {
      final model = await _controller.load();
      setState(() => _result = ApiResult.success(model));
    } catch (error) {
      setState(() => _result = ApiResult.error(error.toString()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${featurePascal}', style: TextStyle(fontSize: 18.sp)),
      ),
      body: ApiStateBuilder<${featurePascal}Model>(
        result: _result,
        onSuccess: (data) => Center(
          child: Text(data.id, style: TextStyle(fontSize: 24.sp)),
        ),
      ),
    );
  }
}
`;
}

export function serviceTemplate(featurePascal: string, featureSnake: string): string {
  return `import '../api_service.dart';

abstract class ${featurePascal}Service {
  Future<Map<String, dynamic>> fetch();
}

class ${featurePascal}ServiceImpl implements ${featurePascal}Service {
  ${featurePascal}ServiceImpl(this._apiService);

  final ApiService _apiService;

  @override
  Future<Map<String, dynamic>> fetch() async {
    return _apiService.get('/${featureSnake.replace(/_/g, '-')}');
  }
}
`;
}

// Backward-compatible aliases used by older imports
export const pageTemplate = riverpodPageTemplate;
export const featureFirstProviderTemplate = (
  featurePascal: string,
  featureSnake: string,
  repositoryImport: string
) => riverpodProviderTemplate(featurePascal, featureSnake, repositoryImport, 'feature-first');
