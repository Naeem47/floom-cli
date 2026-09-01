import 'package:get_it/get_it.dart';

import '../network/api_service.dart';
import '../network/dio_api_service.dart';
import '../network/dio_client.dart';

Future<void> configureDependencies() async {
  final getIt = GetIt.instance;

  if (!getIt.isRegistered<DioClient>()) {
    getIt.registerLazySingleton<DioClient>(DioClient.new);
  }

  if (!getIt.isRegistered<ApiService>()) {
    getIt.registerLazySingleton<ApiService>(
      () => DioApiService(getIt<DioClient>()),
    );
  }

  ApiServiceLocator.override(getIt<ApiService>());
}
