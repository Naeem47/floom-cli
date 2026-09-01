import 'package:dio/dio.dart';

import 'api_service.dart';
import 'dio_client.dart';

class DioApiService implements ApiService {
  DioApiService(this._client);

  final DioClient _client;

  @override
  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    final response = await _client.instance.get<Map<String, dynamic>>(
      path,
      queryParameters: queryParameters,
    );
    return response.data ?? {};
  }

  @override
  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? data,
  }) async {
    final response = await _client.instance.post<Map<String, dynamic>>(
      path,
      data: data,
    );
    return response.data ?? {};
  }
}

class ApiServiceLocator {
  ApiServiceLocator._();

  static ApiService? _instance;

  static ApiService get instance => _instance ??= DioApiService(DioClient());

  static void override(ApiService service) {
    _instance = service;
  }
}
