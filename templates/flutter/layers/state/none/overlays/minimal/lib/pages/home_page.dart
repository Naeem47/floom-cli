import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../core/network/api_result.dart';
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
      body: ApiStateBuilder<String>(
        result: ApiResult.success('{{projectName}}'),
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
