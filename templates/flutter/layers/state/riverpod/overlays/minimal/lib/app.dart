import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants/app_constants.dart';
import 'pages/home_page.dart';

class {{projectNamePascal}}App extends ConsumerWidget {
  const {{projectNamePascal}}App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: AppConstants.appName,
      home: const HomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
