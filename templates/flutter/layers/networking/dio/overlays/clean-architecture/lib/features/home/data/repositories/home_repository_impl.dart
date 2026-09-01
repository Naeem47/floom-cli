import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_service.dart';
import '../../../../core/network/dio_api_service.dart';
import '../../domain/entities/home_entity.dart';
import '../../domain/repositories/home_repository.dart';
import '../models/home_model.dart';

class HomeRepositoryImpl implements HomeRepository {
  HomeRepositoryImpl({ApiService? apiService})
      : _apiService = apiService ?? ApiServiceLocator.instance;

  final ApiService _apiService;

  @override
  Future<HomeEntity> fetch() async {
    try {
      final data = await _apiService.get(ApiEndpoints.home);
      return HomeModel.fromJson(data).toEntity();
    } catch (error) {
      throw Exception('Failed to fetch home: $error');
    }
  }
}
