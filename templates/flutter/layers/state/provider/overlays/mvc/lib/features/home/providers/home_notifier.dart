import 'package:flutter/foundation.dart';

import '../../../../core/network/api_result.dart';
import '../controllers/home_controller.dart';
import '../models/home_model.dart';

class HomeNotifier extends ChangeNotifier {
  HomeNotifier(this._controller);

  final HomeController _controller;

  ApiResult<HomeModel> _result = const ApiResult.initial();

  ApiResult<HomeModel> get result => _result;

  Future<void> load() async {
    _result = const ApiResult.loading();
    notifyListeners();

    try {
      final model = await _controller.load();
      _result = ApiResult.success(model);
    } catch (error) {
      _result = ApiResult.error(error.toString());
    }

    notifyListeners();
  }
}
