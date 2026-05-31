import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../domain/entities/bill_entity.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../core/services/notification_service.dart';
import '../../data/repositories/bill_repository_impl.dart';
import '../../data/datasources/local/database_helper.dart';
import 'auth_provider.dart';
import 'settings_provider.dart';

final billRepositoryProvider = Provider(
    (_) => BillRepositoryImpl(DatabaseHelper.instance));

final billsProvider =
    AsyncNotifierProvider<BillsNotifier, List<BillEntity>>(BillsNotifier.new);

/// Count of pending bills (overdue + due within 7 days) for badge display.
final pendingBillsCountProvider = Provider<int>((ref) {
  final bills = ref.watch(billsProvider).valueOrNull ?? [];
  return bills.where((b) => b.isPending || b.isOverdue).length;
});

class BillsNotifier extends AsyncNotifier<List<BillEntity>> {
  @override
  Future<List<BillEntity>> build() => _fetch();

  Future<List<BillEntity>> _fetch() async {
    final userId = ref.watch(authProvider).valueOrNull?.userId ?? 'default';
    final repo = ref.watch(billRepositoryProvider);
    final result = await repo.getAll(userId);
    return result.fold((f) => throw Exception(f.message), (l) => l);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }

  /// Default reminder days from global settings, or [3, 2, 1, 0] if not set.
  List<int> get _defaultReminderDays {
    final settings = ref.read(settingsProvider).valueOrNull;
    return settings?.billNotificationDays ?? const [3, 2, 1, 0];
  }

  Future<Either<Failure, BillEntity>> create({
    required String title,
    required BillType type,
    required int amountCents,
    required DateTime dueDate,
    String? description,
    String? categoryId,
    String? accountId,
    BillRecurrence recurrence = BillRecurrence.none,
    List<int>? reminderDays,
  }) async {
    final userId =
        ref.read(authProvider).valueOrNull?.userId ?? 'default';
    final repo = ref.read(billRepositoryProvider);
    final days = reminderDays ?? _defaultReminderDays;

    final now = DateTime.now();
    final bill = BillEntity(
      id: const Uuid().v4(),
      userId: userId,
      title: title.trim(),
      description: description?.trim(),
      type: type,
      amountCents: amountCents,
      dueDate: dueDate,
      status: BillStatus.pending,
      categoryId: categoryId,
      accountId: accountId,
      recurrence: recurrence,
      reminderDays: days,
      notificationIds: const [],
      createdAt: now,
      updatedAt: now,
    );

    // Schedule OS notifications and store IDs back in the bill
    final notifIds = await NotificationService.instance
        .scheduleBillReminders(bill);
    final billWithIds = bill.copyWith(notificationIds: notifIds);

    final result = await repo.create(billWithIds);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, BillEntity>> edit(BillEntity updated) async {
    final repo = ref.read(billRepositoryProvider);

    // Cancel old notifications, schedule new ones
    await NotificationService.instance
        .cancelBillReminders(updated.notificationIds);
    final newIds = await NotificationService.instance
        .scheduleBillReminders(updated);
    final billWithIds = updated.copyWith(notificationIds: newIds);

    final result = await repo.save(billWithIds);
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, BillEntity>> markAsPaid(BillEntity bill) async {
    final repo = ref.read(billRepositoryProvider);

    // Cancel all scheduled reminders — no longer needed
    await NotificationService.instance
        .cancelBillReminders(bill.notificationIds);

    final result = await repo.markAsPaid(bill.id, DateTime.now());
    if (result.isRight) await refresh();
    return result;
  }

  Future<Either<Failure, void>> delete(BillEntity bill) async {
    final repo = ref.read(billRepositoryProvider);

    await NotificationService.instance
        .cancelBillReminders(bill.notificationIds);

    final result = await repo.delete(bill.id);
    if (result.isRight) await refresh();
    return result;
  }
}
