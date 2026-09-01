import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import 'design_sizes.dart';

class AppScreenUtil extends StatelessWidget {
  const AppScreenUtil({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final designSize = designSizeForWidth(constraints.maxWidth);

        return ScreenUtilInit(
          key: ValueKey(
            '${designSize.width.toInt()}x${designSize.height.toInt()}',
          ),
          designSize: designSize,
          minTextAdapt: true,
          splitScreenMode: true,
          builder: (context, child) => child ?? const SizedBox.shrink(),
          child: child,
        );
      },
    );
  }
}

/// Resolves design size from available layout width (used at app root).
Size designSizeForWidth(double width) {
  return DesignSizes.resolveWidth(width);
}

/// Resolves design size from [BuildContext] (use inside the widget tree).
Size designSizeForCurrentContext(BuildContext context) {
  return DesignSizes.resolve(context);
}
