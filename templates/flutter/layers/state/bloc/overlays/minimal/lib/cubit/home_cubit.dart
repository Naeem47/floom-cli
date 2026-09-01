import 'package:flutter_bloc/flutter_bloc.dart';

import '../core/network/api_result.dart';

class HomeCubit extends Cubit<ApiResult<String>> {
  HomeCubit() : super(const ApiResult.initial());

  Future<void> load() async {
    emit(const ApiResult.loading());
    await Future<void>.delayed(const Duration(milliseconds: 300));
    emit(ApiResult.success('{{projectName}}'));
  }
}
