import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/bootstrap/app_bootstrap.dart';
import 'core/constants/app_constants.dart';
import 'core/router/app_router.dart';

Future<void> main() async {
  await bootstrapApp(
    const ProviderScope(
      child: {{projectNamePascal}}App(),
    ),
  );
}

class {{projectNamePascal}}App extends ConsumerWidget {
  const {{projectNamePascal}}App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: AppConstants.appName,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
