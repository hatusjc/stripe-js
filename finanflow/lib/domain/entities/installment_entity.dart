enum InstallmentStatus { active, completed, cancelled }

class InstallmentEntity {
  const InstallmentEntity({
    required this.id,
    required this.userId,
    required this.categoryId,
    required this.description,
    required this.totalAmountCents,
    required this.installmentAmountCents,
    required this.totalCount,
    required this.paidCount,
    required this.startDate,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.creditCardId,
  });

  final String id;
  final String userId;
  final String? creditCardId;
  final String categoryId;
  final String description;
  final int totalAmountCents;
  final int installmentAmountCents;
  final int totalCount;
  final int paidCount;
  final DateTime startDate;
  final InstallmentStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  double get totalAmount => totalAmountCents / 100.0;
  double get installmentAmount => installmentAmountCents / 100.0;
  int get remainingCount => totalCount - paidCount;
  bool get isComplete => paidCount >= totalCount;
  double get progressPercent => totalCount > 0 ? paidCount / totalCount : 0;
}
