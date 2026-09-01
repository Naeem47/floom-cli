import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../shared/widgets/api_state_builder.dart';
import '../cubit/home_cubit.dart';
import '../models/home_model.dart';
import '../controllers/home_controller.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  static const routeName = '/';

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => HomeCubit(HomeController())..load(),
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            '{{projectName}}',
            style: TextStyle(fontSize: 18.sp),
          ),
        ),
        body: BlocBuilder<HomeCubit, ApiResult<HomeModel>>(
          builder: (context, result) {
            return ApiStateBuilder<HomeModel>(
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
      ),
    );
  }
}
