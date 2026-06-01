class RouteConstants {
  RouteConstants._();

  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String pinAuth = '/auth/pin';
  static const String biometricAuth = '/auth/biometric';

  // Main tabs
  static const String dashboard = '/dashboard';
  static const String transactions = '/transactions';
  static const String transactionAdd = '/transactions/add';
  static const String transactionDetail = '/transactions/:id';
  static const String calendar = '/calendar';
  static const String reports = '/reports';
  static const String reportDetail = '/reports/:id';
  static const String profile = '/profile';

  // Profile sub-routes
  static const String settings = '/profile/settings';
  static const String security = '/profile/security';
  static const String backup = '/profile/backup';
  static const String categories = '/profile/categories';
  static const String categoryAdd = '/profile/categories/add';
  static const String accounts = '/profile/accounts';
  static const String accountAdd = '/profile/accounts/add';
  static const String cards = '/profile/cards';
  static const String cardAdd = '/profile/cards/add';
  static const String goals = '/profile/goals';
  static const String goalAdd = '/profile/goals/add';
  static const String goalDetail = '/profile/goals/:id';
  static const String budget = '/profile/budget';
  static const String budgetAdd = '/profile/budget/add';
  static const String statistics = '/profile/statistics';
  static const String simulator = '/profile/simulator';
  static const String importStatement = '/transactions/import';
  static const String bills = '/bills';

  // Shortcuts (deep links)
  static const String shortcutAddExpense = '/shortcut/add-expense';
  static const String shortcutAddIncome = '/shortcut/add-income';
}
