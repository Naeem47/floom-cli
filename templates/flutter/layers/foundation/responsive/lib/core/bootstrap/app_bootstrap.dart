import 'package:flutter/material.dart';

import '../di/injection.dart';
import '../responsive/app_screen_util.dart';

Future<void> bootstrapApp(Widget app) async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(AppScreenUtil(child: app));
}
