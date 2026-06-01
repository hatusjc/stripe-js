enum NotificationType { budgetAlert, billDue, goalMilestone, insight, recurring }

class NotificationEntity {
  const NotificationEntity({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.body,
    required this.scheduledAt,
    required this.isRead,
    required this.createdAt,
    this.payload,
    this.deliveredAt,
    this.readAt,
  });

  final String id;
  final String userId;
  final NotificationType type;
  final String title;
  final String body;
  final String? payload;
  final DateTime scheduledAt;
  final DateTime? deliveredAt;
  final DateTime? readAt;
  final bool isRead;
  final DateTime createdAt;

  NotificationEntity markRead() => NotificationEntity(
        id: id,
        userId: userId,
        type: type,
        title: title,
        body: body,
        payload: payload,
        scheduledAt: scheduledAt,
        deliveredAt: deliveredAt,
        readAt: DateTime.now(),
        isRead: true,
        createdAt: createdAt,
      );
}
