import 'package:get_it/get_it.dart';

import '../network/api_service.dart';
import '../network/http_api_service.dart';
import '../network/http_client.dart';

Future<void> configureDependencies() async {
  final getIt = GetIt.instance;

  if (!getIt.isRegistered<HttpClient>()) {
    getIt.registerLazySingleton<HttpClient>(HttpClient.new);
  }

  if (!getIt.isRegistered<ApiService>()) {
    getIt.registerLazySingleton<ApiService>(
      () => HttpApiService(getIt<HttpClient>()),
    );
  }

  ApiServiceLocator.override(getIt<ApiService>());
}
