import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/home/views/home_view.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: HomeView.routeName,
    routes: [
      GoRoute(
        path: HomeView.routeName,
        builder: (context, state) => const HomeView(),
      ),
    ],
  );
});
