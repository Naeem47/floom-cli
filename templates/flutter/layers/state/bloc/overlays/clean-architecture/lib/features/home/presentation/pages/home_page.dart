import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../core/network/api_result.dart';
import '../../../../shared/widgets/api_state_builder.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../domain/entities/home_entity.dart';
import '../cubit/home_cubit.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  static const routeName = '/';

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => HomeCubit(HomeRepositoryImpl())..load(),
      child: const _HomeView(),
    );
  }
}

class _HomeView extends StatelessWidget {
  const _HomeView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '{{projectName}}',
          style: TextStyle(fontSize: 18.sp),
        ),
      ),
      body: BlocBuilder<HomeCubit, ApiResult<HomeEntity>>(
        builder: (context, result) {
          return ApiStateBuilder<HomeEntity>(
            result: result,
            onSuccess: (home) => Center(
              child: Text(
                home.title,
                style: TextStyle(fontSize: 24.sp),
              ),
            ),
          );
        },
      ),
    );
  }
}
