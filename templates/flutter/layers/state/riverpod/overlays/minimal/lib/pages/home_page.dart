import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../core/network/api_result.dart';
import '../shared/widgets/api_state_builder.dart';

final homeProvider = Provider<ApiResult<String>>(
  (_) => ApiResult.success('{{projectName}}'),
);

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

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
      body: ApiStateBuilder<String>(
        result: result,
        onSuccess: (title) => Center(
          child: Text(
            title,
            style: TextStyle(fontSize: 24.sp),
          ),
        ),
      ),
    );
  }
}
