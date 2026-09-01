import 'package:flutter/material.dart';

import '../core/constants/app_constants.dart';
import 'pages/home_page.dart';

class {{projectNamePascal}}App extends StatelessWidget {
  const {{projectNamePascal}}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      home: const HomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
