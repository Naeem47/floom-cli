import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../core/network/api_result.dart';
import '../cubit/home_cubit.dart';
import '../shared/widgets/api_state_builder.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '{{projectName}}',
          style: TextStyle(fontSize: 18.sp),
        ),
      ),
      body: BlocBuilder<HomeCubit, ApiResult<String>>(
        builder: (context, result) {
          return ApiStateBuilder<String>(
            result: result,
            onSuccess: (title) => Center(
              child: Text(
                title,
                style: TextStyle(fontSize: 24.sp),
              ),
            ),
          );
        },
      ),
    );
  }
}
