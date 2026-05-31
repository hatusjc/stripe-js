import 'dart:convert';
import '../../domain/entities/bill_entity.dart';
import '../../core/extensions/datetime_extension.dart';

class BillModel extends BillEntity {
  const BillModel({
    required super.id,
    required super.userId,
    required super.title,
    required super.type,
    required super.amountCents,
    required super.dueDate,
    required super.status,
    required super.reminderDays,
    required super.notificationIds,
    required super.createdAt,
    required super.updatedAt,
    super.description,
    super.categoryId,
    super.accountId,
    super.recurrence,
    super.paidAt,
    super.deletedAt,
  });

  factory BillModel.fromMap(Map<String, dynamic> m) => BillModel(
        id: m['id'] as String,
        userId: m['user_id'] as String,
        title: m['title'] as String,
        description: m['description'] as String?,
        type: BillType.values.firstWhere(
          (e) => e.name == (m['type'] as String),
          orElse: () => BillType.payable,
        ),
        amountCents: m['amount'] as int,
        dueDate: DateTimeExtension.fromMs(m['due_date'] as int),
        status: BillStatus.values.firstWhere(
          (e) => e.name == (m['status'] as String? ?? 'pending'),
          orElse: () => BillStatus.pending,
        ),
        categoryId: m['category_id'] as String?,
        accountId: m['account_id'] as String?,
        recurrence: BillRecurrence.values.firstWhere(
          (e) => e.name == (m['recurrence'] as String? ?? 'none'),
          orElse: () => BillRecurrence.none,
        ),
        reminderDays: m['reminder_days'] != null
            ? List<int>.from(jsonDecode(m['reminder_days'] as String))
            : const [3, 2, 1, 0],
        notificationIds: m['notification_ids'] != null
            ? List<int>.from(jsonDecode(m['notification_ids'] as String))
            : const [],
        paidAt: m['paid_at'] != null
            ? DateTimeExtension.fromMs(m['paid_at'] as int)
            : null,
        createdAt: DateTimeExtension.fromMs(m['created_at'] as int),
        updatedAt: DateTimeExtension.fromMs(m['updated_at'] as int),
        deletedAt: m['deleted_at'] != null
            ? DateTimeExtension.fromMs(m['deleted_at'] as int)
            : null,
      );

  factory BillModel.fromEntity(BillEntity e) => BillModel(
        id: e.id,
        userId: e.userId,
        title: e.title,
        description: e.description,
        type: e.type,
        amountCents: e.amountCents,
        dueDate: e.dueDate,
        status: e.status,
        categoryId: e.categoryId,
        accountId: e.accountId,
        recurrence: e.recurrence,
        reminderDays: e.reminderDays,
        notificationIds: e.notificationIds,
        paidAt: e.paidAt,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        deletedAt: e.deletedAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'title': title,
        'description': description,
        'type': type.name,
        'amount': amountCents,
        'due_date': dueDate.millisecondsSinceEpochUtc,
        'status': status.name,
        'category_id': categoryId,
        'account_id': accountId,
        'recurrence': recurrence.name,
        'reminder_days': jsonEncode(reminderDays),
        'notification_ids': jsonEncode(notificationIds),
        'paid_at': paidAt?.millisecondsSinceEpochUtc,
        'created_at': createdAt.millisecondsSinceEpochUtc,
        'updated_at': updatedAt.millisecondsSinceEpochUtc,
        'deleted_at': deletedAt?.millisecondsSinceEpochUtc,
      };
}
