import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../domain/entities/home_entity.dart';
import '../providers/home_notifier.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  static const routeName = '/';

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => HomeNotifier(HomeRepositoryImpl())..load(),
      child: const _HomeView(),
    );
  }
}

class _HomeView extends StatelessWidget {
  const _HomeView();

  @override
  Widget build(BuildContext context) {
    final result = context.watch<HomeNotifier>().result;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '{{projectName}}',
          style: TextStyle(fontSize: 18.sp),
        ),
      ),
      body: ApiStateBuilder<HomeEntity>(
        result: result,
        onSuccess: (home) => Center(
          child: Text(
            home.title,
            style: TextStyle(fontSize: 24.sp),
          ),
        ),
      ),
    );
  }
}
