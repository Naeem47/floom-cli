import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_result.dart';
import '../models/home_entity.dart';
import '../repositories/home_repository.dart';

class HomeCubit extends Cubit<ApiResult<HomeEntity>> {
  HomeCubit(this._repository) : super(const ApiResult.initial());

  final HomeRepository _repository;

  Future<void> load() async {
    emit(const ApiResult.loading());
    try {
      final entity = await _repository.fetch();
      emit(ApiResult.success(entity));
    } catch (error) {
      emit(ApiResult.error(error.toString()));
    }
  }
}
