import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz_data;
import '../theme/app_colors.dart';
import '../../domain/entities/bill_entity.dart';

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final _plugin = FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;
    tz_data.initializeTimeZones();

    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    await _plugin.initialize(
      const InitializationSettings(
          android: androidSettings, iOS: iosSettings),
    );
    _initialized = true;
  }

  Future<bool> requestPermissions() async {
    final androidPlugin =
        _plugin.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    final iosPlugin =
        _plugin.resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>();

    bool granted = true;
    if (androidPlugin != null) {
      granted = await androidPlugin.requestNotificationsPermission() ?? false;
    }
    if (iosPlugin != null) {
      granted = await iosPlugin.requestPermissions(
            alert: true,
            badge: true,
            sound: true,
          ) ??
          false;
    }
    return granted;
  }

  /// Schedules OS notifications for a bill based on its [reminderDays].
  /// Returns the list of OS notification IDs that were actually scheduled.
  Future<List<int>> scheduleBillReminders(BillEntity bill) async {
    if (!_initialized) await initialize();

    final scheduledIds = <int>[];
    final now = DateTime.now();

    for (final daysBefore in bill.reminderDays) {
      final dueDay = DateTime(
          bill.dueDate.year, bill.dueDate.month, bill.dueDate.day);
      final notifyDay = dueDay.subtract(Duration(days: daysBefore));
      // Fire at 9:00 AM on the reminder day
      final notifyAt = DateTime(
          notifyDay.year, notifyDay.month, notifyDay.day, 9, 0);

      // Skip past notifications
      if (notifyAt.isBefore(now)) continue;

      final osId = _notificationId(bill.id, daysBefore);
      final title = _buildTitle(bill, daysBefore);
      final body =
          '${bill.title} — R\$ ${(bill.amountCents / 100).toStringAsFixed(2).replaceAll('.', ',')}';

      try {
        await _plugin.zonedSchedule(
          osId,
          title,
          body,
          tz.TZDateTime.from(notifyAt, tz.local),
          _buildDetails(bill.type),
          androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
          uiLocalNotificationDateInterpretation:
              UILocalNotificationDateInterpretation.absoluteTime,
          payload: 'bill:${bill.id}',
        );
        scheduledIds.add(osId);
      } catch (_) {
        // Exact alarms may be unavailable; silently skip
      }
    }
    return scheduledIds;
  }

  /// Cancels all OS notifications for a bill by their stored IDs.
  Future<void> cancelBillReminders(List<int> notificationIds) async {
    for (final id in notificationIds) {
      await _plugin.cancel(id);
    }
  }

  /// Cancel all notifications (e.g., on logout).
  Future<void> cancelAll() => _plugin.cancelAll();

  // ── Helpers ────────────────────────────────────────────────────────────────

  /// Deterministic OS int ID: unique per (billId, daysBefore) pair.
  int _notificationId(String billId, int daysBefore) =>
      (billId.hashCode.abs() % 200000) * 10 + daysBefore;

  String _buildTitle(BillEntity bill, int daysBefore) {
    final verb =
        bill.type == BillType.payable ? 'Pagamento' : 'Recebimento';
    return switch (daysBefore) {
      0 => '$verb hoje: ${bill.title}',
      1 => '$verb amanhã: ${bill.title}',
      _ => '$verb em $daysBefore dias: ${bill.title}',
    };
  }

  NotificationDetails _buildDetails(BillType type) {
    final isPayable = type == BillType.payable;
    return NotificationDetails(
      android: AndroidNotificationDetails(
        isPayable ? 'bills_payable' : 'bills_receivable',
        isPayable ? 'Contas a Pagar' : 'Contas a Receber',
        channelDescription: 'Lembretes de vencimento',
        importance: Importance.high,
        priority: Priority.high,
        color: isPayable ? AppColors.expense : AppColors.income,
        icon: '@mipmap/ic_launcher',
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
  }
}
