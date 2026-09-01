import 'package:flutter/material.dart';

import '../di/injection.dart';
import '../firebase/firebase_app.dart';
import '../firebase/firebase_post_init.dart';
import '../responsive/app_screen_util.dart';

Future<void> bootstrapApp(Widget app) async {
  WidgetsFlutterBinding.ensureInitialized();
  await FirebaseAppService.initialize();
  await configureFirebaseServices();
  await configureDependencies();
  runApp(AppScreenUtil(child: app));
}
