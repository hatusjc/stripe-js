import 'package:flutter/material.dart';
import '../../domain/entities/category_entity.dart';
import '../../core/extensions/datetime_extension.dart';

class CategoryModel extends CategoryEntity {
  const CategoryModel({
    required super.id,
    required super.userId,
    required super.name,
    required super.type,
    required super.iconName,
    required super.color,
    required super.isSystem,
    required super.isActive,
    required super.sortOrder,
    required super.createdAt,
    super.parentId,
    super.deletedAt,
  });

  factory CategoryModel.fromMap(Map<String, dynamic> map) => CategoryModel(
        id: map['id'] as String,
        userId: map['user_id'] as String,
        name: map['name'] as String,
        type: CategoryType.values.firstWhere(
          (e) => e.name == (map['type'] as String? ?? 'expense'),
          orElse: () => CategoryType.expense,
        ),
        iconName: map['icon_name'] as String,
        color: Color(map['color'] as int),
        isSystem: (map['is_system'] as int? ?? 0) == 1,
        isActive: (map['is_active'] as int? ?? 1) == 1,
        parentId: map['parent_id'] as String?,
        sortOrder: map['sort_order'] as int? ?? 0,
        createdAt: DateTimeExtension.fromMs(map['created_at'] as int),
        deletedAt: map['deleted_at'] != null
            ? DateTimeExtension.fromMs(map['deleted_at'] as int)
            : null,
      );

  factory CategoryModel.fromEntity(CategoryEntity entity) => CategoryModel(
        id: entity.id,
        userId: entity.userId,
        name: entity.name,
        type: entity.type,
        iconName: entity.iconName,
        color: entity.color,
        isSystem: entity.isSystem,
        isActive: entity.isActive,
        parentId: entity.parentId,
        sortOrder: entity.sortOrder,
        createdAt: entity.createdAt,
        deletedAt: entity.deletedAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'name': name,
        'type': type.name,
        'icon_name': iconName,
        'color': color.toARGB32(),
        'is_system': isSystem ? 1 : 0,
        'is_active': isActive ? 1 : 0,
        'parent_id': parentId,
        'sort_order': sortOrder,
        'created_at': createdAt.millisecondsSinceEpochUtc,
        'deleted_at': deletedAt?.millisecondsSinceEpochUtc,
      };
}
