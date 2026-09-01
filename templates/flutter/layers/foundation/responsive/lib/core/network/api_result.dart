import 'api_state.dart';

class ApiResult<T> {
  const ApiResult._({
    required this.state,
    this.data,
    this.errorMessage,
  });

  const ApiResult.initial() : this._(state: ApiState.initial);

  const ApiResult.loading() : this._(state: ApiState.loading);

  ApiResult.success(T data)
      : this._(state: ApiState.success, data: data);

  ApiResult.error(String message)
      : this._(state: ApiState.error, errorMessage: message);

  final ApiState state;
  final T? data;
  final String? errorMessage;

  bool get isInitial => state == ApiState.initial;
  bool get isLoading => state == ApiState.loading;
  bool get isSuccess => state == ApiState.success;
  bool get isError => state == ApiState.error;
}
