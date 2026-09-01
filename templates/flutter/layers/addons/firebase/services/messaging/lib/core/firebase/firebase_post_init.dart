import 'package:firebase_messaging/firebase_messaging.dart';

import 'firebase_messaging_background.dart';
import 'services/firebase_messaging_service.dart';

Future<void> configureFirebaseServices() async {
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  await FirebaseMessagingService().initialize();
}
