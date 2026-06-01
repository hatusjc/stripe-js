import 'package:flutter/material.dart';

enum CategoryType { income, expense, both }

class CategoryEntity {
  const CategoryEntity({
    required this.id,
    required this.userId,
    required this.name,
    required this.type,
    required this.iconName,
    required this.color,
    required this.isSystem,
    required this.isActive,
    required this.sortOrder,
    required this.createdAt,
    this.parentId,
    this.deletedAt,
  });

  final String id;
  final String userId;
  final String name;
  final CategoryType type;
  final String iconName;
  final Color color;
  final bool isSystem;
  final bool isActive;
  final String? parentId;
  final int sortOrder;
  final DateTime createdAt;
  final DateTime? deletedAt;

  bool get isDeleted => deletedAt != null;

  CategoryEntity copyWith({
    String? name,
    CategoryType? type,
    String? iconName,
    Color? color,
    bool? isActive,
    String? parentId,
    int? sortOrder,
  }) =>
      CategoryEntity(
        id: id,
        userId: userId,
        name: name ?? this.name,
        type: type ?? this.type,
        iconName: iconName ?? this.iconName,
        color: color ?? this.color,
        isSystem: isSystem,
        isActive: isActive ?? this.isActive,
        sortOrder: sortOrder ?? this.sortOrder,
        createdAt: createdAt,
        parentId: parentId ?? this.parentId,
      );
}
