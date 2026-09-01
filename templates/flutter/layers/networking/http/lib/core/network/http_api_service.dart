import '../network/api_service.dart';
import '../network/http_api_service.dart';
import '../network/http_client.dart';

class HttpApiService implements ApiService {
  HttpApiService(this._client);

  final HttpClient _client;

  @override
  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    final uri = Uri.parse(path).replace(queryParameters: queryParameters);
    return _client.getJson(uri);
  }

  @override
  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? data,
  }) async {
    throw UnimplementedError('Add post support in HttpClient when needed');
  }
}

class ApiServiceLocator {
  ApiServiceLocator._();

  static ApiService? _instance;

  static ApiService get instance => _instance ??= HttpApiService(HttpClient());

  static void override(ApiService service) {
    _instance = service;
  }
}
