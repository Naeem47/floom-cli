import 'package:flutter/foundation.dart';

import '../../../../core/network/api_result.dart';
import '../../domain/entities/home_entity.dart';
import '../../domain/repositories/home_repository.dart';

class HomeNotifier extends ChangeNotifier {
  HomeNotifier(this._repository);

  final HomeRepository _repository;

  ApiResult<HomeEntity> _result = const ApiResult.initial();

  ApiResult<HomeEntity> get result => _result;

  Future<void> load() async {
    _result = const ApiResult.loading();
    notifyListeners();

    try {
      final entity = await _repository.fetch();
      _result = ApiResult.success(entity);
    } catch (error) {
      _result = ApiResult.error(error.toString());
    }

    notifyListeners();
  }
}
