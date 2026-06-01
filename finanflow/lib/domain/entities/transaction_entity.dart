enum TransactionType { income, expense, transfer }
enum TransactionStatus { confirmed, pending, cancelled }
enum RecurrenceType { none, weekly, biweekly, monthly, yearly }

class TransactionEntity {
  const TransactionEntity({
    required this.id,
    required this.userId,
    required this.categoryId,
    required this.type,
    required this.amountCents,
    required this.date,
    required this.status,
    required this.isRecurring,
    required this.createdAt,
    required this.updatedAt,
    this.accountId,
    this.creditCardId,
    this.description,
    this.notes,
    this.recurrenceRule,
    this.recurrenceId,
    this.installmentId,
    this.installmentNum,
    this.transferId,
    this.tags,
    this.latitude,
    this.longitude,
    this.deletedAt,
  });

  final String id;
  final String userId;
  final String? accountId;
  final String? creditCardId;
  final String categoryId;
  final TransactionType type;
  final int amountCents;
  final String? description;
  final String? notes;
  final DateTime date;
  final bool isRecurring;
  final String? recurrenceRule;
  final String? recurrenceId;
  final String? installmentId;
  final int? installmentNum;
  final String? transferId;
  final TransactionStatus status;
  final List<String>? tags;
  final double? latitude;
  final double? longitude;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;

  double get amount => amountCents / 100.0;
  bool get isDeleted => deletedAt != null;
  bool get isInstallment => installmentId != null;

  TransactionEntity copyWith({
    String? categoryId,
    String? accountId,
    String? creditCardId,
    TransactionType? type,
    int? amountCents,
    String? description,
    String? notes,
    DateTime? date,
    TransactionStatus? status,
    List<String>? tags,
  }) =>
      TransactionEntity(
        id: id,
        userId: userId,
        accountId: accountId ?? this.accountId,
        creditCardId: creditCardId ?? this.creditCardId,
        categoryId: categoryId ?? this.categoryId,
        type: type ?? this.type,
        amountCents: amountCents ?? this.amountCents,
        description: description ?? this.description,
        notes: notes ?? this.notes,
        date: date ?? this.date,
        isRecurring: isRecurring,
        recurrenceRule: recurrenceRule,
        recurrenceId: recurrenceId,
        installmentId: installmentId,
        installmentNum: installmentNum,
        transferId: transferId,
        status: status ?? this.status,
        tags: tags ?? this.tags,
        latitude: latitude,
        longitude: longitude,
        createdAt: createdAt,
        updatedAt: DateTime.now(),
      );
}
