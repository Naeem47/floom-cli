import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/home/pages/home_page.dart';

GoRouter createAppRouter() {
  return GoRouter(
    initialLocation: HomePage.routeName,
    routes: [
      GoRoute(
        path: HomePage.routeName,
        builder: (context, state) => const HomePage(),
      ),
    ],
  );
}
