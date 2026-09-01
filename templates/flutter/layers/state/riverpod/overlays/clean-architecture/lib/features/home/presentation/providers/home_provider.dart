import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../domain/entities/home_entity.dart';
import '../../domain/repositories/home_repository.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepositoryImpl();
});

class HomeNotifier extends Notifier<ApiResult<HomeEntity>> {
  @override
  ApiResult<HomeEntity> build() {
    Future.microtask(load);
    return const ApiResult.initial();
  }

  Future<void> load() async {
    state = const ApiResult.loading();
    try {
      final entity = await ref.read(homeRepositoryProvider).fetch();
      state = ApiResult.success(entity);
    } catch (error) {
      state = ApiResult.error(error.toString());
    }
  }
}

final homeProvider =
    NotifierProvider<HomeNotifier, ApiResult<HomeEntity>>(HomeNotifier.new);
