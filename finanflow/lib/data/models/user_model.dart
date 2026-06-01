import '../../domain/entities/user_entity.dart';
import '../../core/extensions/datetime_extension.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.name,
    required super.currencyCode,
    required super.locale,
    required super.createdAt,
    required super.updatedAt,
    super.email,
    super.avatarPath,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) => UserModel(
        id: map['id'] as String,
        name: map['name'] as String,
        email: map['email'] as String?,
        avatarPath: map['avatar_path'] as String?,
        currencyCode: map['currency_code'] as String? ?? 'BRL',
        locale: map['locale'] as String? ?? 'pt',
        createdAt: DateTimeExtension.fromMs(map['created_at'] as int),
        updatedAt: DateTimeExtension.fromMs(map['updated_at'] as int),
      );

  factory UserModel.fromEntity(UserEntity entity) => UserModel(
        id: entity.id,
        name: entity.name,
        email: entity.email,
        avatarPath: entity.avatarPath,
        currencyCode: entity.currencyCode,
        locale: entity.locale,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'email': email,
        'avatar_path': avatarPath,
        'currency_code': currencyCode,
        'locale': locale,
        'created_at': createdAt.millisecondsSinceEpochUtc,
        'updated_at': updatedAt.millisecondsSinceEpochUtc,
      };
}
