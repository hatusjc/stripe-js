enum PlanType { free, premium }

class PlanEntity {
  const PlanEntity({
    required this.type,
    this.expiresAt,
    this.transactionId,
  });

  final PlanType type;
  final DateTime? expiresAt;
  final String? transactionId;

  bool get isActive {
    if (type == PlanType.free) return true;
    if (expiresAt == null) return true;
    return DateTime.now().isBefore(expiresAt!);
  }

  PlanEntity copyWith({
    PlanType? type,
    DateTime? expiresAt,
    String? transactionId,
  }) =>
      PlanEntity(
        type: type ?? this.type,
        expiresAt: expiresAt ?? this.expiresAt,
        transactionId: transactionId ?? this.transactionId,
      );

  static const PlanEntity free = PlanEntity(type: PlanType.free);
}
