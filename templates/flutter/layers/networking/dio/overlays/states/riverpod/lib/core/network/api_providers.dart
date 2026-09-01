import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'dio_api_service.dart';
import 'dio_client.dart';

final dioClientProvider = Provider<DioClient>((ref) => DioClient());

final apiServiceProvider = Provider<DioApiService>((ref) {
  return DioApiService(ref.watch(dioClientProvider));
});
