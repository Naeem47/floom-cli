import 'package:flutter/material.dart';

import 'core/bootstrap/app_bootstrap.dart';
import 'core/constants/app_constants.dart';
import 'core/router/app_router.dart';

Future<void> main() async {
  await bootstrapApp(const {{projectNamePascal}}App());
}

class {{projectNamePascal}}App extends StatelessWidget {
  const {{projectNamePascal}}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppConstants.appName,
      routerConfig: createAppRouter(),
      debugShowCheckedModeBanner: false,
    );
  }
}
