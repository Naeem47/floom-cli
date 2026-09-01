import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../core/network/api_result.dart';
import '../../../../shared/widgets/api_state_builder.dart';
import '../controllers/home_controller.dart';
import '../models/home_model.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  static const routeName = '/';

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  final _controller = HomeController();
  ApiResult<HomeModel> _result = const ApiResult.initial();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _result = const ApiResult.loading());
    try {
      final model = await _controller.load();
      setState(() => _result = ApiResult.success(model));
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
      body: ApiStateBuilder<HomeModel>(
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
