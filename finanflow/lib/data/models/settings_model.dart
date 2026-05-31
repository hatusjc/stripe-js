import 'dart:convert';
import '../../domain/entities/settings_entity.dart';
import '../../domain/entities/plan_entity.dart';
import '../../core/theme/app_theme.dart';
import '../../core/extensions/datetime_extension.dart';

class SettingsModel extends SettingsEntity {
  const SettingsModel({
    required super.id,
    required super.userId,
    required super.themeMode,
    required super.language,
    required super.currencyCode,
    required super.notificationsEnabled,
    required super.hideBalance,
    required super.firstDayOfWeek,
    required super.decimalSeparator,
    required super.thousandsSeparator,
    required super.onboardingComplete,
    required super.biometricEnabled,
    required super.plan,
    required super.updatedAt,
    super.billNotificationDays,
  });

  factory SettingsModel.fromMap(Map<String, dynamic> map) {
    final themeModeStr = map['theme_mode'] as String? ?? 'system';
    final themeMode = AppThemeMode.values.firstWhere(
      (e) => e.name == themeModeStr,
      orElse: () => AppThemeMode.system,
    );

    final planTypeStr = map['plan_type'] as String? ?? 'free';
    final planType = PlanType.values.firstWhere(
      (e) => e.name == planTypeStr,
      orElse: () => PlanType.free,
    );
    final planExpiresAt = map['plan_expires_at'] != null
        ? DateTimeExtension.fromMs(map['plan_expires_at'] as int)
        : null;

    return SettingsModel(
      id: map['id'] as String,
      userId: map['user_id'] as String,
      themeMode: themeMode,
      language: map['language'] as String? ?? 'pt',
      currencyCode: map['currency_code'] as String? ?? 'BRL',
      notificationsEnabled: (map['notifications_enabled'] as int? ?? 1) == 1,
      hideBalance: (map['hide_balance'] as int? ?? 0) == 1,
      firstDayOfWeek: map['first_day_of_week'] as int? ?? 1,
      decimalSeparator: map['decimal_separator'] as String? ?? ',',
      thousandsSeparator: map['thousands_separator'] as String? ?? '.',
      onboardingComplete: (map['onboarding_complete'] as int? ?? 0) == 1,
      biometricEnabled: (map['biometric_enabled'] as int? ?? 0) == 1,
      plan: PlanEntity(
        type: planType,
        expiresAt: planExpiresAt,
        transactionId: map['plan_transaction_id'] as String?,
      ),
      billNotificationDays: map['bill_notification_days'] != null
          ? List<int>.from(
              jsonDecode(map['bill_notification_days'] as String))
          : const [3, 2, 1, 0],
      updatedAt: DateTimeExtension.fromMs(map['updated_at'] as int),
    );
  }

  factory SettingsModel.fromEntity(SettingsEntity entity) => SettingsModel(
        id: entity.id,
        userId: entity.userId,
        themeMode: entity.themeMode,
        language: entity.language,
        currencyCode: entity.currencyCode,
        notificationsEnabled: entity.notificationsEnabled,
        hideBalance: entity.hideBalance,
        firstDayOfWeek: entity.firstDayOfWeek,
        decimalSeparator: entity.decimalSeparator,
        thousandsSeparator: entity.thousandsSeparator,
        onboardingComplete: entity.onboardingComplete,
        biometricEnabled: entity.biometricEnabled,
        plan: entity.plan,
        billNotificationDays: entity.billNotificationDays,
        updatedAt: entity.updatedAt,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'user_id': userId,
        'theme_mode': themeMode.name,
        'language': language,
        'currency_code': currencyCode,
        'notifications_enabled': notificationsEnabled ? 1 : 0,
        'hide_balance': hideBalance ? 1 : 0,
        'first_day_of_week': firstDayOfWeek,
        'decimal_separator': decimalSeparator,
        'thousands_separator': thousandsSeparator,
        'onboarding_complete': onboardingComplete ? 1 : 0,
        'biometric_enabled': biometricEnabled ? 1 : 0,
        'plan_type': plan.type.name,
        'plan_expires_at': plan.expiresAt?.millisecondsSinceEpochUtc,
        'plan_transaction_id': plan.transactionId,
        'bill_notification_days': jsonEncode(billNotificationDays),
        'updated_at': updatedAt.millisecondsSinceEpochUtc,
      };
}
