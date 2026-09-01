import '../models/home_entity.dart';

abstract class HomeRepository {
  Future<HomeEntity> fetch();
}
