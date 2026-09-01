import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../core/network/api_result.dart';
import '../shared/widgets/api_state_builder.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  ApiResult<String> _result = const ApiResult.initial();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _result = const ApiResult.loading());
    await Future<void>.delayed(const Duration(milliseconds: 300));
    setState(() => _result = ApiResult.success('{{projectName}}'));
  }

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
        result: _result,
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
