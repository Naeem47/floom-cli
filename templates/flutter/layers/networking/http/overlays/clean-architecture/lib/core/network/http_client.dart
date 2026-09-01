import 'dart:convert';

import 'package:http/http.dart' as http;

class HttpClient {
  HttpClient({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<Map<String, dynamic>> getJson(Uri uri) async {
    final response = await _client.get(uri);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw HttpException('Request failed: ${response.statusCode}');
  }
}

class HttpException implements Exception {
  HttpException(this.message);

  final String message;

  @override
  String toString() => message;
}
