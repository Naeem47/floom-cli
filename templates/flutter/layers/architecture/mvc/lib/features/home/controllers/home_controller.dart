import '../models/home_model.dart';

class HomeController {
  Future<HomeModel> load() async {
    return const HomeModel(title: '{{projectName}}');
  }
}
