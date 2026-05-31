class UserEntity {
  const UserEntity({
    required this.id,
    required this.name,
    required this.currencyCode,
    required this.locale,
    required this.createdAt,
    required this.updatedAt,
    this.email,
    this.avatarPath,
  });

  final String id;
  final String name;
  final String? email;
  final String? avatarPath;
  final String currencyCode;
  final String locale;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserEntity copyWith({
    String? name,
    String? email,
    String? avatarPath,
    String? currencyCode,
    String? locale,
  }) =>
      UserEntity(
        id: id,
        name: name ?? this.name,
        email: email ?? this.email,
        avatarPath: avatarPath ?? this.avatarPath,
        currencyCode: currencyCode ?? this.currencyCode,
        locale: locale ?? this.locale,
        createdAt: createdAt,
        updatedAt: DateTime.now(),
      );
}
