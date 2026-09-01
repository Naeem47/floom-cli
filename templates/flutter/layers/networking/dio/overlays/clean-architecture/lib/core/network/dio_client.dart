import 'package:dio/dio.dart';

class DioClient {
  DioClient({Dio? dio}) : _dio = dio ?? Dio() {
    _dio.options = BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    );
  }

  final Dio _dio;

  Dio get instance => _dio;
}
