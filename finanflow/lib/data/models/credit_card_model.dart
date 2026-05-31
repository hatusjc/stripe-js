import 'package:flutter/material.dart';
import '../../domain/entities/credit_card_entity.dart';
import '../../core/extensions/datetime_extension.dart';

class CreditCardModel extends CreditCardEntity {
  const CreditCardModel({
    required super.id,
    required super.userId,
    required super.name,
    required super.creditLimitCents,
    required super.closingDay,
    required super.dueDay,
    required super.color,
    required super.isActive,
    required super.createdAt,
    required super.updatedAt,
    super.accountId,
    super.lastFour,
    super.brand,
    super.iconName,
    super.deletedAt,
  });

  factory CreditCardModel.fromMap(Map<String, dynamic> m) => CreditCardModel(
        id: m['id'] as String,
        userId: m['user_id'] as String,
        accountId: m['account_id'] as String?,
        name: m['name'] as String,
        lastFour: m['last_four'] as String?,
        brand: m['brand'] != null
            ? CardBrand.values.firstWhere(
                (b) => b.name == m['brand'],
                orElse: () => CardBrand.other,
              )
            : null,
        creditLimitCents: m['credit_limit'] as int,
        closingDay: m['closing_day'] as int,
        dueDay: m['due_day'] as int,
        color: Color(m['color'] as int),
        iconName: m['icon_name'] as String?,
        isActive: (m['is_active'] as int? ?? 1) == 1,
        createdAt: DateTimeExtension.fromMs(m['created_at'] as int),
        updatedAt: DateTimeExtension.fromMs(m['updated_at'] as int),
        deletedAt: m['deleted_at'] != null
            ? DateTimeExtension.fromMs(m['deleted_at'] as int)
            : null,
      );

  factory CreditCardModel.fromEntity(CreditCardEntity e) => CreditCardModel(
        id: e.id,
        userId: e.userId,
        accountId: e.accountId,
        name: e.name,
        lastFour: e.lastFour,
        brand: e.brand,
        creditLimitCents: e.creditLimitCents,
        closingDay: e.closingDay,
        dueDay: e.dueDay,
        color: e.color,
        iconName: e.iconName,
        isActive: e.isActive,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        deletedAt: e.deletedAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'account_id': accountId,
        'name': name,
        'last_four': lastFour,
        'brand': brand?.name,
        'credit_limit': creditLimitCents,
        'closing_day': closingDay,
        'due_day': dueDay,
        'color': color.toARGB32(),
        'icon_name': iconName,
        'is_active': isActive ? 1 : 0,
        'created_at': createdAt.millisecondsSinceEpochUtc,
        'updated_at': updatedAt.millisecondsSinceEpochUtc,
        'deleted_at': deletedAt?.millisecondsSinceEpochUtc,
      };
}
