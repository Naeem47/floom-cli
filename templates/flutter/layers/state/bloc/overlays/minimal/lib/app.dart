import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../core/constants/app_constants.dart';
import 'cubit/home_cubit.dart';
import 'pages/home_page.dart';

class {{projectNamePascal}}App extends StatelessWidget {
  const {{projectNamePascal}}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      home: BlocProvider(
        create: (_) => HomeCubit()..load(),
        child: const HomePage(),
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
