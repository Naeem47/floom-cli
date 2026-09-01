class ApiEndpoints {
  ApiEndpoints._();

  /// Example resource endpoints — update to match your backend.
  static const home = '/home';
  static const users = '/users';

  static String resource(String name) => '/$name';
  static String resourceById(String name, String id) => '/$name/$id';
}
