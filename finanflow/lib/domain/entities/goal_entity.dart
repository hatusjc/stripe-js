import 'package:flutter/material.dart';

enum GoalType { savings, debtPayoff, emergencyFund, investment, purchase, other }
enum GoalStatus { active, paused, completed, cancelled }

class GoalEntity {
  const GoalEntity({
    required this.id,
    required this.userId,
    required this.name,
    required this.type,
    required this.targetAmountCents,
    required this.currentAmountCents,
    required this.color,
    required this.priority,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.accountId,
    this.description,
    this.targetDate,
    this.iconName,
    this.monthlyContributionCents,
    this.deletedAt,
  });

  final String id;
  final String userId;
  final String? accountId;
  final String name;
  final String? description;
  final GoalType type;
  final int targetAmountCents;
  final int currentAmountCents;
  final DateTime? targetDate;
  final String? iconName;
  final Color color;
  final GoalStatus status;
  final int priority;
  final int? monthlyContributionCents;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;

  double get targetAmount => targetAmountCents / 100.0;
  double get currentAmount => currentAmountCents / 100.0;
  double get progressPercent =>
      targetAmountCents > 0 ? (currentAmountCents / targetAmountCents).clamp(0.0, 1.0) : 0;
  int get remainingAmountCents => (targetAmountCents - currentAmountCents).clamp(0, targetAmountCents);
  bool get isComplete => currentAmountCents >= targetAmountCents;
  bool get isDeleted => deletedAt != null;

  DateTime? get estimatedCompletion {
    if (isComplete) return DateTime.now();
    if (monthlyContributionCents == null || monthlyContributionCents! <= 0) return null;
    final monthsRemaining = remainingAmountCents / monthlyContributionCents!;
    return DateTime.now().add(Duration(days: (monthsRemaining * 30).round()));
  }

  GoalEntity copyWith({
    String? name,
    String? description,
    GoalType? type,
    int? targetAmountCents,
    int? currentAmountCents,
    DateTime? targetDate,
    String? iconName,
    Color? color,
    GoalStatus? status,
    int? priority,
    int? monthlyContributionCents,
  }) =>
      GoalEntity(
        id: id,
        userId: userId,
        accountId: accountId,
        name: name ?? this.name,
        description: description ?? this.description,
        type: type ?? this.type,
        targetAmountCents: targetAmountCents ?? this.targetAmountCents,
        currentAmountCents: currentAmountCents ?? this.currentAmountCents,
        targetDate: targetDate ?? this.targetDate,
        iconName: iconName ?? this.iconName,
        color: color ?? this.color,
        status: status ?? this.status,
        priority: priority ?? this.priority,
        monthlyContributionCents: monthlyContributionCents ?? this.monthlyContributionCents,
        createdAt: createdAt,
        updatedAt: DateTime.now(),
      );
}
