import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import '../models/home_model.dart';
import '../providers/home_provider.dart';

class HomeView extends ConsumerWidget {
  const HomeView({super.key});

  static const routeName = '/';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(homeProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '{{projectName}}',
          style: TextStyle(fontSize: 18.sp),
        ),
      ),
      body: ApiStateBuilder<HomeModel>(
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
