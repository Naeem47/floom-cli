import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../core/network/api_result.dart';
import '../../../../shared/widgets/api_state_builder.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../domain/entities/home_entity.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  static const routeName = '/';

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _repository = HomeRepositoryImpl();
  ApiResult<HomeEntity> _result = const ApiResult.initial();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _result = const ApiResult.loading());
    try {
      final entity = await _repository.fetch();
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
