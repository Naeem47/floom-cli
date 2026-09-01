import 'package:flutter/material.dart';

class DesignSizes {
  DesignSizes._();

  static const mobile = Size(375, 812);
  static const tablet = Size(768, 1024);
  static const desktop = Size(1440, 900);

  static Size resolveWidth(double width) {
    if (width >= 1024) {
      return desktop;
    }
    if (width >= 600) {
      return tablet;
    }
    return mobile;
  }

  static Size resolve(BuildContext context) {
    return resolveWidth(MediaQuery.sizeOf(context).width);
  }
}
