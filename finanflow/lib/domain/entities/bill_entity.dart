enum BillType { payable, receivable }
enum BillStatus { pending, paid, received, overdue, cancelled }
enum BillRecurrence { none, weekly, monthly, yearly }

class BillEntity {
  const BillEntity({
    required this.id,
    required this.userId,
    required this.title,
    required this.type,
    required this.amountCents,
    required this.dueDate,
    required this.status,
    required this.reminderDays,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.categoryId,
    this.accountId,
    this.recurrence = BillRecurrence.none,
    this.notificationIds = const [],
    this.paidAt,
    this.deletedAt,
  });

  final String id;
  final String userId;
  final String title;
  final String? description;
  final BillType type;
  final int amountCents;
  final DateTime dueDate;
  final BillStatus status;
  final String? categoryId;
  final String? accountId;
  final BillRecurrence recurrence;

  /// Days before due date to notify. [0] = on the day, [1] = 1 day before, etc.
  final List<int> reminderDays;

  /// OS notification IDs so we can cancel them later.
  final List<int> notificationIds;

  final DateTime? paidAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;

  double get amount => amountCents / 100.0;

  int get daysUntilDue {
    final today = DateTime(
        DateTime.now().year, DateTime.now().month, DateTime.now().day);
    final due =
        DateTime(dueDate.year, dueDate.month, dueDate.day);
    return due.difference(today).inDays;
  }

  bool get isPending => status == BillStatus.pending;

  bool get isOverdue =>
      isPending &&
      DateTime(dueDate.year, dueDate.month, dueDate.day)
          .isBefore(DateTime(DateTime.now().year, DateTime.now().month,
              DateTime.now().day));

  bool get isDueToday => daysUntilDue == 0;

  bool get isSettled =>
      status == BillStatus.paid || status == BillStatus.received;

  BillStatus get effectiveStatus {
    if (isOverdue) return BillStatus.overdue;
    return status;
  }

  BillEntity copyWith({
    String? title,
    String? description,
    BillType? type,
    int? amountCents,
    DateTime? dueDate,
    BillStatus? status,
    String? categoryId,
    String? accountId,
    BillRecurrence? recurrence,
    List<int>? reminderDays,
    List<int>? notificationIds,
    DateTime? paidAt,
    DateTime? updatedAt,
  }) =>
      BillEntity(
        id: id,
        userId: userId,
        title: title ?? this.title,
        description: description ?? this.description,
        type: type ?? this.type,
        amountCents: amountCents ?? this.amountCents,
        dueDate: dueDate ?? this.dueDate,
        status: status ?? this.status,
        categoryId: categoryId ?? this.categoryId,
        accountId: accountId ?? this.accountId,
        recurrence: recurrence ?? this.recurrence,
        reminderDays: reminderDays ?? this.reminderDays,
        notificationIds: notificationIds ?? this.notificationIds,
        paidAt: paidAt ?? this.paidAt,
        createdAt: createdAt,
        updatedAt: updatedAt ?? DateTime.now(),
        deletedAt: deletedAt,
      );
}
