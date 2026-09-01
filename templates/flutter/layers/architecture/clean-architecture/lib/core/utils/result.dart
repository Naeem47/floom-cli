sealed class Result<T> {
  const Result();
}

final class Success<T> extends Result<T> {
  const Success(this.value);

  final T value;
}

final class ErrorResult<T> extends Result<T> {
  const ErrorResult(this.failure);

  final Object failure;
}
