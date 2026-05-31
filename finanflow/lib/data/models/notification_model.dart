import '../../domain/entities/notification_entity.dart';
import '../../core/extensions/datetime_extension.dart';

class NotificationModel extends NotificationEntity {
  const NotificationModel({
    required super.id,
    required super.userId,
    required super.type,
    required super.title,
    required super.body,
    required super.scheduledAt,
    required super.isRead,
    required super.createdAt,
    super.payload,
    super.deliveredAt,
    super.readAt,
  });

  factory NotificationModel.fromMap(Map<String, dynamic> m) =>
      NotificationModel(
        id: m['id'] as String,
        userId: m['user_id'] as String,
        type: NotificationType.values.firstWhere(
          (e) => e.name == (m['type'] as String),
          orElse: () => NotificationType.billDue,
        ),
        title: m['title'] as String,
        body: m['body'] as String,
        payload: m['payload'] as String?,
        scheduledAt: DateTimeExtension.fromMs(m['scheduled_at'] as int),
        deliveredAt: m['delivered_at'] != null
            ? DateTimeExtension.fromMs(m['delivered_at'] as int)
            : null,
        readAt: m['read_at'] != null
            ? DateTimeExtension.fromMs(m['read_at'] as int)
            : null,
        isRead: (m['is_read'] as int? ?? 0) == 1,
        createdAt: DateTimeExtension.fromMs(m['created_at'] as int),
      );

  factory NotificationModel.fromEntity(NotificationEntity e) =>
      NotificationModel(
        id: e.id,
        userId: e.userId,
        type: e.type,
        title: e.title,
        body: e.body,
        payload: e.payload,
        scheduledAt: e.scheduledAt,
        deliveredAt: e.deliveredAt,
        readAt: e.readAt,
        isRead: e.isRead,
        createdAt: e.createdAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'type': type.name,
        'title': title,
        'body': body,
        'payload': payload,
        'scheduled_at': scheduledAt.millisecondsSinceEpochUtc,
        'delivered_at': deliveredAt?.millisecondsSinceEpochUtc,
        'read_at': readAt?.millisecondsSinceEpochUtc,
        'is_read': isRead ? 1 : 0,
        'created_at': createdAt.millisecondsSinceEpochUtc,
      };
}
