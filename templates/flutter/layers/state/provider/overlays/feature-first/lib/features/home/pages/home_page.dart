import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import '../models/home_entity.dart';
import '../providers/home_notifier.dart';
import '../repositories/home_repository_impl.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  static const routeName = '/';

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => HomeNotifier(HomeRepositoryImpl())..load(),
      child: Builder(
        builder: (context) {
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
        },
      ),
    );
  }
}
