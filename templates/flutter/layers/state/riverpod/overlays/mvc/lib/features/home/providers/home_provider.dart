import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import '../controllers/home_controller.dart';
import '../models/home_model.dart';

final homeControllerProvider = Provider<HomeController>((ref) {
  return HomeController();
});

class HomeNotifier extends Notifier<ApiResult<HomeModel>> {
  @override
  ApiResult<HomeModel> build() {
    Future.microtask(load);
    return const ApiResult.initial();
  }

  Future<void> load() async {
    state = const ApiResult.loading();
    try {
      final model = await ref.read(homeControllerProvider).load();
      state = ApiResult.success(model);
    } catch (error) {
      state = ApiResult.error(error.toString());
    }
  }
}

final homeProvider =
    NotifierProvider<HomeNotifier, ApiResult<HomeModel>>(HomeNotifier.new);
