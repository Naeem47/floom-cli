import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/home/views/home_view.dart';

GoRouter createAppRouter() {
  return GoRouter(
    initialLocation: HomeView.routeName,
    routes: [
      GoRoute(
        path: HomeView.routeName,
        builder: (context, state) => const HomeView(),
      ),
    ],
  );
}
