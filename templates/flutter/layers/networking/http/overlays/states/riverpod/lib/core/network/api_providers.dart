import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'http_api_service.dart';
import 'http_client.dart';

final httpClientProvider = Provider<HttpClient>((ref) => HttpClient());

final apiServiceProvider = Provider<HttpApiService>((ref) {
  return HttpApiService(ref.watch(httpClientProvider));
});
