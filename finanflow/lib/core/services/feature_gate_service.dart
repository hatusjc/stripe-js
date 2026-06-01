import '../../domain/entities/plan_entity.dart';
import '../constants/app_constants.dart';

class FeatureGateService {
  const FeatureGateService(this.plan);
  final PlanType plan;

  bool get isPremium => plan == PlanType.premium;

  // Premium-only features
  bool get canExportPDF => isPremium;
  bool get canExportExcel => isPremium;
  bool get canExportCSV => isPremium;
  bool get canUseSimulator => isPremium;
  bool get canViewStatistics => isPremium;
  bool get canAddCreditCards => isPremium;
  bool get canSetBudgets => isPremium;
  bool get canUseNotifications => isPremium;
  bool get canUseInsights => isPremium;
  bool get canBackupLocal => isPremium;
  bool get canBackupCloud => isPremium;
  bool get canImportStatementUnlimited => isPremium;
  bool get canUseOcr => isPremium;
  bool get canUseFullWidget => isPremium;
  bool get canUseFamilyMode => isPremium;
  bool get canUseVoiceShortcuts => isPremium;

  // Free features
  bool get canUsePrivacyMode => true;
  bool get canUseAmoledTheme => true;
  bool get canViewHealthScore => true;
  bool get canUseBasicWidget => true;
  bool get canImportStatementLimited => true;

  // Free tier limits
  int get maxAccounts => isPremium ? 999 : AppConstants.freeMaxAccounts;
  int get maxCategories => isPremium ? 999 : AppConstants.freeMaxCategories;
  int get maxGoals => isPremium ? 999 : AppConstants.freeMaxGoals;
  int get maxTransactions => isPremium ? 999999 : AppConstants.freeMaxTransactions;
  int get statementImportLimit => isPremium ? 999999 : AppConstants.freeStatementImportLimit;
}
