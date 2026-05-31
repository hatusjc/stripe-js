import 'package:flutter/material.dart';
import '../../domain/entities/account_entity.dart';
import '../../core/extensions/datetime_extension.dart';

class AccountModel extends AccountEntity {
  const AccountModel({
    required super.id,
    required super.userId,
    required super.name,
    required super.type,
    required super.initialBalanceCents,
    required super.currentBalanceCents,
    required super.color,
    required super.iconName,
    required super.currencyCode,
    required super.includeInTotal,
    required super.isActive,
    required super.sortOrder,
    required super.createdAt,
    required super.updatedAt,
    super.bankName,
    super.bankLogo,
    super.deletedAt,
  });

  factory AccountModel.fromMap(Map<String, dynamic> map) => AccountModel(
        id: map['id'] as String,
        userId: map['user_id'] as String,
        name: map['name'] as String,
        type: AccountType.values.firstWhere(
          (e) => e.name == (map['type'] as String? ?? 'checking'),
          orElse: () => AccountType.checking,
        ),
        bankName: map['bank_name'] as String?,
        bankLogo: map['bank_logo'] as String?,
        initialBalanceCents: map['initial_balance'] as int? ?? 0,
        currentBalanceCents: map['current_balance'] as int? ?? 0,
        color: Color(map['color'] as int),
        iconName: map['icon_name'] as String? ?? 'account_balance',
        currencyCode: map['currency_code'] as String? ?? 'BRL',
        includeInTotal: (map['include_in_total'] as int? ?? 1) == 1,
        isActive: (map['is_active'] as int? ?? 1) == 1,
        sortOrder: map['sort_order'] as int? ?? 0,
        createdAt: DateTimeExtension.fromMs(map['created_at'] as int),
        updatedAt: DateTimeExtension.fromMs(map['updated_at'] as int),
        deletedAt: map['deleted_at'] != null
            ? DateTimeExtension.fromMs(map['deleted_at'] as int)
            : null,
      );

  factory AccountModel.fromEntity(AccountEntity entity) => AccountModel(
        id: entity.id,
        userId: entity.userId,
        name: entity.name,
        type: entity.type,
        bankName: entity.bankName,
        bankLogo: entity.bankLogo,
        initialBalanceCents: entity.initialBalanceCents,
        currentBalanceCents: entity.currentBalanceCents,
        color: entity.color,
        iconName: entity.iconName,
        currencyCode: entity.currencyCode,
        includeInTotal: entity.includeInTotal,
        isActive: entity.isActive,
        sortOrder: entity.sortOrder,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'name': name,
        'type': type.name,
        'bank_name': bankName,
        'bank_logo': bankLogo,
        'initial_balance': initialBalanceCents,
        'current_balance': currentBalanceCents,
        'color': color.toARGB32(),
        'icon_name': iconName,
        'currency_code': currencyCode,
        'include_in_total': includeInTotal ? 1 : 0,
        'is_active': isActive ? 1 : 0,
        'sort_order': sortOrder,
        'created_at': createdAt.millisecondsSinceEpochUtc,
        'updated_at': updatedAt.millisecondsSinceEpochUtc,
        'deleted_at': deletedAt?.millisecondsSinceEpochUtc,
      };
}
