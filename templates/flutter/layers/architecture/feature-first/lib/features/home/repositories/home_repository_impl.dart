import '../models/home_entity.dart';
import '../repositories/home_repository.dart';

class HomeRepositoryImpl implements HomeRepository {
  @override
  Future<HomeEntity> fetch() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    return const HomeEntity(title: '{{projectName}}');
  }
}
