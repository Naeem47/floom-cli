import 'package:firebase_core/firebase_core.dart';

import '../../firebase_options.dart';

class FirebaseAppService {
  FirebaseAppService._();

  static Future<void> initialize() async {
    if (Firebase.apps.isNotEmpty) {
      return;
    }

    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }
}
