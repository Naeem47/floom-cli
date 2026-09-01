import '../../domain/entities/home_entity.dart';
import '../../domain/repositories/home_repository.dart';
import '../models/home_model.dart';

class HomeRepositoryImpl implements HomeRepository {
  @override
  Future<HomeEntity> fetch() async {
    // Local fallback when networking is disabled.
    // Enable dio/http layer for real API calls via ApiService.
    await Future<void>.delayed(const Duration(milliseconds: 200));
    return const HomeEntity(title: '{{projectName}}');
  }
}
