import 'package:flutter/material.dart';

import '../../core/network/api_result.dart';
import '../../core/network/api_state.dart';

class ApiStateBuilder<T> extends StatelessWidget {
  const ApiStateBuilder({
    super.key,
    required this.result,
    required this.onSuccess,
    this.onInitial,
    this.onLoading,
    this.onError,
  });

  final ApiResult<T> result;
  final Widget Function(T data) onSuccess;
  final WidgetBuilder? onInitial;
  final WidgetBuilder? onLoading;
  final Widget Function(String message)? onError;

  @override
  Widget build(BuildContext context) {
    switch (result.state) {
      case ApiState.initial:
        return onInitial?.call(context) ??
            onLoading?.call(context) ??
            const SizedBox.shrink();
      case ApiState.loading:
        return onLoading?.call(context) ??
            const Center(child: CircularProgressIndicator());
      case ApiState.success:
        final data = result.data;
        if (data == null) {
          return onError?.call('Missing data') ??
              const Center(child: Text('Missing data'));
        }
        return onSuccess(data);
      case ApiState.error:
        final message = result.errorMessage ?? 'Unknown error';
        return onError?.call(message) ?? Center(child: Text(message));
    }
  }
}
