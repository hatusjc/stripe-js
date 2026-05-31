import '../../core/theme/app_theme.dart';
import 'plan_entity.dart';

class SettingsEntity {
  const SettingsEntity({
    required this.id,
    required this.userId,
    required this.themeMode,
    required this.language,
    required this.currencyCode,
    required this.notificationsEnabled,
    required this.hideBalance,
    required this.firstDayOfWeek,
    required this.decimalSeparator,
    required this.thousandsSeparator,
    required this.onboardingComplete,
    required this.biometricEnabled,
    required this.plan,
    required this.updatedAt,
    this.billNotificationDays = const [3, 2, 1, 0],
  });

  final String id;
  final String userId;
  final AppThemeMode themeMode;
  final String language;
  final String currencyCode;
  final bool notificationsEnabled;
  final bool hideBalance;
  final int firstDayOfWeek;
  final String decimalSeparator;
  final String thousandsSeparator;
  final bool onboardingComplete;
  final bool biometricEnabled;
  final PlanEntity plan;
  final DateTime updatedAt;

  /// Days before due date to notify by default (e.g. [3, 2, 1, 0]).
  final List<int> billNotificationDays;

  SettingsEntity copyWith({
    AppThemeMode? themeMode,
    String? language,
    String? currencyCode,
    bool? notificationsEnabled,
    bool? hideBalance,
    int? firstDayOfWeek,
    String? decimalSeparator,
    String? thousandsSeparator,
    bool? onboardingComplete,
    bool? biometricEnabled,
    PlanEntity? plan,
    List<int>? billNotificationDays,
  }) =>
      SettingsEntity(
        id: id,
        userId: userId,
        themeMode: themeMode ?? this.themeMode,
        language: language ?? this.language,
        currencyCode: currencyCode ?? this.currencyCode,
        notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
        hideBalance: hideBalance ?? this.hideBalance,
        firstDayOfWeek: firstDayOfWeek ?? this.firstDayOfWeek,
        decimalSeparator: decimalSeparator ?? this.decimalSeparator,
        thousandsSeparator: thousandsSeparator ?? this.thousandsSeparator,
        onboardingComplete: onboardingComplete ?? this.onboardingComplete,
        biometricEnabled: biometricEnabled ?? this.biometricEnabled,
        plan: plan ?? this.plan,
        billNotificationDays: billNotificationDays ?? this.billNotificationDays,
        updatedAt: DateTime.now(),
      );

  static SettingsEntity defaultSettings(String userId) => SettingsEntity(
        id: userId,
        userId: userId,
        themeMode: AppThemeMode.system,
        language: 'pt',
        currencyCode: 'BRL',
        notificationsEnabled: true,
        hideBalance: false,
        firstDayOfWeek: 1,
        decimalSeparator: ',',
        thousandsSeparator: '.',
        onboardingComplete: false,
        biometricEnabled: false,
        plan: PlanEntity.free,
        billNotificationDays: const [3, 2, 1, 0],
        updatedAt: DateTime.now(),
      );
}
