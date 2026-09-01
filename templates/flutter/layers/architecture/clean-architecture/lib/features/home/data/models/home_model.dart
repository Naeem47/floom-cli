import '../../domain/entities/home_entity.dart';

class HomeModel {
  const HomeModel({required this.title});

  final String title;

  factory HomeModel.fromJson(Map<String, dynamic> json) {
    return HomeModel(title: json['title'] as String);
  }

  Map<String, dynamic> toJson() => {'title': title};

  HomeEntity toEntity() => HomeEntity(title: title);
}
