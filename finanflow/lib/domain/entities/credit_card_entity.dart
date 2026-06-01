import 'package:flutter/material.dart';

enum CardBrand { visa, mastercard, amex, elo, hipercard, other }

class CreditCardEntity {
  const CreditCardEntity({
    required this.id,
    required this.userId,
    required this.name,
    required this.creditLimitCents,
    required this.closingDay,
    required this.dueDay,
    required this.color,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.accountId,
    this.lastFour,
    this.brand,
    this.iconName,
    this.deletedAt,
  });

  final String id;
  final String userId;
  final String? accountId;
  final String name;
  final String? lastFour;
  final CardBrand? brand;
  final int creditLimitCents;
  final int closingDay;
  final int dueDay;
  final Color color;
  final String? iconName;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;

  double get creditLimit => creditLimitCents / 100.0;
  bool get isDeleted => deletedAt != null;

  CreditCardEntity copyWith({
    String? name,
    String? lastFour,
    CardBrand? brand,
    int? creditLimitCents,
    int? closingDay,
    int? dueDay,
    Color? color,
    bool? isActive,
  }) =>
      CreditCardEntity(
        id: id,
        userId: userId,
        accountId: accountId,
        name: name ?? this.name,
        lastFour: lastFour ?? this.lastFour,
        brand: brand ?? this.brand,
        creditLimitCents: creditLimitCents ?? this.creditLimitCents,
        closingDay: closingDay ?? this.closingDay,
        dueDay: dueDay ?? this.dueDay,
        color: color ?? this.color,
        iconName: iconName,
        isActive: isActive ?? this.isActive,
        createdAt: createdAt,
        updatedAt: DateTime.now(),
      );
}
