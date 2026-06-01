import 'package:flutter/material.dart';

enum AccountType { checking, savings, investment, cash, other }

class AccountEntity {
  const AccountEntity({
    required this.id,
    required this.userId,
    required this.name,
    required this.type,
    required this.initialBalanceCents,
    required this.currentBalanceCents,
    required this.color,
    required this.iconName,
    required this.currencyCode,
    required this.includeInTotal,
    required this.isActive,
    required this.sortOrder,
    required this.createdAt,
    required this.updatedAt,
    this.bankName,
    this.bankLogo,
    this.deletedAt,
  });

  final String id;
  final String userId;
  final String name;
  final AccountType type;
  final int initialBalanceCents;
  final int currentBalanceCents;
  final Color color;
  final String iconName;
  final String currencyCode;
  final bool includeInTotal;
  final bool isActive;
  final int sortOrder;
  final String? bankName;
  final String? bankLogo;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;

  double get currentBalance => currentBalanceCents / 100.0;
  bool get isDeleted => deletedAt != null;

  AccountEntity copyWith({
    String? name,
    AccountType? type,
    int? currentBalanceCents,
    Color? color,
    String? iconName,
    bool? includeInTotal,
    bool? isActive,
    int? sortOrder,
    String? bankName,
  }) =>
      AccountEntity(
        id: id,
        userId: userId,
        name: name ?? this.name,
        type: type ?? this.type,
        initialBalanceCents: initialBalanceCents,
        currentBalanceCents: currentBalanceCents ?? this.currentBalanceCents,
        color: color ?? this.color,
        iconName: iconName ?? this.iconName,
        currencyCode: currencyCode,
        includeInTotal: includeInTotal ?? this.includeInTotal,
        isActive: isActive ?? this.isActive,
        sortOrder: sortOrder ?? this.sortOrder,
        bankName: bankName ?? this.bankName,
        bankLogo: bankLogo,
        createdAt: createdAt,
        updatedAt: DateTime.now(),
      );
}
