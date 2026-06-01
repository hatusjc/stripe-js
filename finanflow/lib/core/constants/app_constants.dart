class AppConstants {
  AppConstants._();

  static const String appName = 'FinanFlow';
  static const String appVersion = '1.0.0';

  // Auth
  static const int pinLength = 6;
  static const int maxPinAttempts = 5;
  static const Duration sessionTimeout = Duration(minutes: 5);
  static const Duration lockoutBase = Duration(seconds: 30);

  // Pagination
  static const int transactionPageSize = 50;

  // Free tier limits
  static const int freeMaxAccounts = 2;
  static const int freeMaxCategories = 10;
  static const int freeMaxGoals = 2;
  static const int freeMaxTransactions = 100;
  static const int freeStatementImportLimit = 50;

  // Cache
  static const int dbCacheSizeKb = 8000;

  // Backup
  static const List<int> backupMagic = [0x46, 0x46, 0x42, 0x4B]; // FFBK
  static const int backupVersion = 1;
  static const String backupExtension = '.ffbk';
  static const String bankProfileExtension = '.ffprofile';

  // Default currencies
  static const List<String> supportedCurrencies = ['BRL', 'USD', 'EUR'];
  static const String defaultCurrency = 'BRL';

  // Default locale
  static const String defaultLocale = 'pt';
  static const List<String> supportedLocales = ['pt', 'en', 'es'];
}
