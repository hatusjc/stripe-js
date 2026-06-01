import '../../domain/entities/budget_entity.dart';
import '../../core/extensions/datetime_extension.dart';

class BudgetModel extends BudgetEntity {
  const BudgetModel({
    required super.id,
    required super.userId,
    required super.name,
    required super.amountCents,
    required super.period,
    required super.startDate,
    required super.alertAt,
    required super.isActive,
    required super.createdAt,
    required super.updatedAt,
    super.categoryId,
    super.endDate,
    super.deletedAt,
  });

  factory BudgetModel.fromMap(Map<String, dynamic> m) => BudgetModel(
        id: m['id'] as String,
        userId: m['user_id'] as String,
        categoryId: m['category_id'] as String?,
        name: m['name'] as String,
        amountCents: m['amount'] as int,
        period: BudgetPeriod.values.firstWhere(
          (e) => e.name == (m['period'] as String? ?? 'monthly'),
          orElse: () => BudgetPeriod.monthly,
        ),
        startDate: DateTimeExtension.fromMs(m['start_date'] as int),
        endDate: m['end_date'] != null
            ? DateTimeExtension.fromMs(m['end_date'] as int)
            : null,
        alertAt: m['alert_at'] as int? ?? 80,
        isActive: (m['is_active'] as int? ?? 1) == 1,
        createdAt: DateTimeExtension.fromMs(m['created_at'] as int),
        updatedAt: DateTimeExtension.fromMs(m['updated_at'] as int),
        deletedAt: m['deleted_at'] != null
            ? DateTimeExtension.fromMs(m['deleted_at'] as int)
            : null,
      );

  factory BudgetModel.fromEntity(BudgetEntity e) => BudgetModel(
        id: e.id,
        userId: e.userId,
        categoryId: e.categoryId,
        name: e.name,
        amountCents: e.amountCents,
        period: e.period,
        startDate: e.startDate,
        endDate: e.endDate,
        alertAt: e.alertAt,
        isActive: e.isActive,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        deletedAt: e.deletedAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'category_id': categoryId,
        'name': name,
        'amount': amountCents,
        'period': period.name,
        'start_date': startDate.millisecondsSinceEpochUtc,
        'end_date': endDate?.millisecondsSinceEpochUtc,
        'alert_at': alertAt,
        'is_active': isActive ? 1 : 0,
        'created_at': createdAt.millisecondsSinceEpochUtc,
        'updated_at': updatedAt.millisecondsSinceEpochUtc,
        'deleted_at': deletedAt?.millisecondsSinceEpochUtc,
      };
}
