import 'package:firebase_analytics/firebase_analytics.dart';

class FirebaseAnalyticsService {
  FirebaseAnalyticsService({FirebaseAnalytics? analytics})
      : _analytics = analytics ?? FirebaseAnalytics.instance;

  final FirebaseAnalytics _analytics;

  Future<void> logEvent({
    required String name,
    Map<String, Object>? parameters,
  }) {
    return _analytics.logEvent(name: name, parameters: parameters);
  }

  Future<void> setUserId(String? userId) => _analytics.setUserId(id: userId);
}
