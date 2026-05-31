class DbConstants {
  DbConstants._();

  static const String dbName = 'finanflow.db';
  static const int dbVersion = 1;

  // Tables
  static const String tableUsers = 'users';
  static const String tableSettings = 'settings';
  static const String tableCategories = 'categories';
  static const String tableAccounts = 'accounts';
  static const String tableCreditCards = 'credit_cards';
  static const String tableTransactions = 'transactions';
  static const String tableInstallments = 'installments';
  static const String tableBudgets = 'budgets';
  static const String tableGoals = 'goals';
  static const String tableNotifications = 'notifications';
  static const String tableReports = 'reports';
  static const String tableBackups = 'backups';
  static const String tableLogs = 'logs';

  // Common columns
  static const String colId = 'id';
  static const String colUserId = 'user_id';
  static const String colCreatedAt = 'created_at';
  static const String colUpdatedAt = 'updated_at';
  static const String colDeletedAt = 'deleted_at';

  // Secure storage keys
  static const String keyEncryptionKey = 'ff_encryption_key';
  static const String keyPinHash = 'ff_pin_hash';
  static const String keyPinSalt = 'ff_pin_salt';
  static const String keyPinAttempts = 'ff_pin_attempts';
  static const String keyLockoutUntil = 'ff_lockout_until';
  static const String keyBiometricEnabled = 'ff_biometric_enabled';
}
