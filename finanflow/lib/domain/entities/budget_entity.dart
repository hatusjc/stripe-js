enum BudgetPeriod { weekly, monthly, yearly, custom }

class BudgetEntity {
  const BudgetEntity({
    required this.id,
    required this.userId,
    required this.name,
    required this.amountCents,
    required this.period,
    required this.startDate,
    required this.alertAt,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.categoryId,
    this.endDate,
    this.deletedAt,
  });

  final String id;
  final String userId;
  final String? categoryId;
  final String name;
  final int amountCents;
  final BudgetPeriod period;
  final DateTime startDate;
  final DateTime? endDate;
  final int alertAt;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;

  double get amount => amountCents / 100.0;
  bool get isDeleted => deletedAt != null;
  bool get isOverall => categoryId == null;

  double spentPercent(int spentCents) =>
      amountCents > 0 ? (spentCents / amountCents).clamp(0.0, 1.0) : 0;

  bool isOverAlert(int spentCents) =>
      spentCents >= (amountCents * alertAt / 100).round();
}
