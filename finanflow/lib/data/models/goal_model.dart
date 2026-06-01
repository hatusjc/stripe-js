import 'package:flutter/material.dart';
import '../../domain/entities/goal_entity.dart';
import '../../core/extensions/datetime_extension.dart';

class GoalModel extends GoalEntity {
  const GoalModel({
    required super.id,
    required super.userId,
    required super.name,
    required super.type,
    required super.targetAmountCents,
    required super.currentAmountCents,
    required super.color,
    required super.priority,
    required super.status,
    required super.createdAt,
    required super.updatedAt,
    super.accountId,
    super.description,
    super.targetDate,
    super.iconName,
    super.monthlyContributionCents,
    super.deletedAt,
  });

  factory GoalModel.fromMap(Map<String, dynamic> m) => GoalModel(
        id: m['id'] as String,
        userId: m['user_id'] as String,
        accountId: m['account_id'] as String?,
        name: m['name'] as String,
        description: m['description'] as String?,
        type: GoalType.values.firstWhere(
          (e) => e.name == (m['type'] as String? ?? 'savings'),
          orElse: () => GoalType.savings,
        ),
        targetAmountCents: m['target_amount'] as int,
        currentAmountCents: m['current_amount'] as int? ?? 0,
        targetDate: m['target_date'] != null
            ? DateTimeExtension.fromMs(m['target_date'] as int)
            : null,
        iconName: m['icon_name'] as String?,
        color: Color(m['color'] as int),
        status: GoalStatus.values.firstWhere(
          (e) => e.name == (m['status'] as String? ?? 'active'),
          orElse: () => GoalStatus.active,
        ),
        priority: m['priority'] as int? ?? 1,
        monthlyContributionCents: m['monthly_contribution'] as int?,
        createdAt: DateTimeExtension.fromMs(m['created_at'] as int),
        updatedAt: DateTimeExtension.fromMs(m['updated_at'] as int),
        deletedAt: m['deleted_at'] != null
            ? DateTimeExtension.fromMs(m['deleted_at'] as int)
            : null,
      );

  factory GoalModel.fromEntity(GoalEntity e) => GoalModel(
        id: e.id,
        userId: e.userId,
        accountId: e.accountId,
        name: e.name,
        description: e.description,
        type: e.type,
        targetAmountCents: e.targetAmountCents,
        currentAmountCents: e.currentAmountCents,
        targetDate: e.targetDate,
        iconName: e.iconName,
        color: e.color,
        status: e.status,
        priority: e.priority,
        monthlyContributionCents: e.monthlyContributionCents,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        deletedAt: e.deletedAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'account_id': accountId,
        'name': name,
        'description': description,
        'type': type.name,
        'target_amount': targetAmountCents,
        'current_amount': currentAmountCents,
        'target_date': targetDate?.millisecondsSinceEpochUtc,
        'icon_name': iconName,
        'color': color.toARGB32(),
        'status': status.name,
        'priority': priority,
        'monthly_contribution': monthlyContributionCents,
        'created_at': createdAt.millisecondsSinceEpochUtc,
        'updated_at': updatedAt.millisecondsSinceEpochUtc,
        'deleted_at': deletedAt?.millisecondsSinceEpochUtc,
      };
}
