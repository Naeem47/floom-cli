import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../core/network/api_result.dart';
import '../../../../shared/widgets/api_state_builder.dart';
import '../models/home_entity.dart';
import '../repositories/home_repository_impl.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  static const routeName = '/';

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  ApiResult<HomeEntity> _result = const ApiResult.initial();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _result = const ApiResult.loading());
    try {
      final entity = await HomeRepositoryImpl().fetch();
      setState(() => _result = ApiResult.success(entity));
    } catch (error) {
      setState(() => _result = ApiResult.error(error.toString()));
    }
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
      body: ApiStateBuilder<HomeEntity>(
        result: _result,
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
