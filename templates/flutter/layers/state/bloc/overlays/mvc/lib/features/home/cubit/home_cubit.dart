import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_result.dart';
import '../controllers/home_controller.dart';
import '../models/home_model.dart';

class HomeCubit extends Cubit<ApiResult<HomeModel>> {
  HomeCubit(this._controller) : super(const ApiResult.initial());

  final HomeController _controller;

  Future<void> load() async {
    emit(const ApiResult.loading());
    try {
      final model = await _controller.load();
      emit(ApiResult.success(model));
    } catch (error) {
      emit(ApiResult.error(error.toString()));
    }
  }
}
