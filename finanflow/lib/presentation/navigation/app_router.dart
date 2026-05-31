import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/route_constants.dart';
import '../providers/auth_provider.dart';
import '../screens/splash/splash_screen.dart';
import '../screens/onboarding/onboarding_screen.dart';
import '../screens/auth/pin_screen.dart';
import '../screens/auth/biometric_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/transactions/transactions_screen.dart';
import '../screens/transactions/add_transaction_screen.dart';
import '../screens/transactions/transaction_detail_screen.dart';
import '../screens/calendar/calendar_screen.dart';
import '../screens/reports/reports_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/settings/security_screen.dart';
import '../screens/settings/backup_screen.dart';
import '../screens/categories/categories_screen.dart';
import '../screens/accounts/accounts_screen.dart';
import '../screens/credit_cards/credit_cards_screen.dart';
import '../screens/goals/goals_screen.dart';
import '../screens/budget/budget_screen.dart';
import '../screens/statistics/statistics_screen.dart';
import '../screens/simulator/simulator_screen.dart';
import '../screens/bills/bills_screen.dart';
import 'app_navigation.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: RouteConstants.splash,
    redirect: (context, state) {
      final auth = authState.valueOrNull;
      if (auth == null) return null;

      final loc = state.matchedLocation;

      // Always allow splash through
      if (loc == RouteConstants.splash) return null;

      // Onboarding gate
      if (!auth.onboardingComplete) {
        if (loc == RouteConstants.onboarding) return null;
        return RouteConstants.onboarding;
      }

      // Auth gate
      if (!auth.isAuthenticated) {
        if (loc == RouteConstants.pinAuth || loc == RouteConstants.biometricAuth) return null;
        if (auth.biometricAvailable) return RouteConstants.biometricAuth;
        return RouteConstants.pinAuth;
      }

      // Already authenticated — redirect away from auth screens
      if (loc == RouteConstants.pinAuth || loc == RouteConstants.biometricAuth) {
        return RouteConstants.dashboard;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: RouteConstants.splash,
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: RouteConstants.onboarding,
        builder: (_, __) => const OnboardingScreen(),
      ),
      GoRoute(
        path: RouteConstants.pinAuth,
        builder: (_, __) => const PinScreen(),
      ),
      GoRoute(
        path: RouteConstants.biometricAuth,
        builder: (_, __) => const BiometricScreen(),
      ),

      // Main shell with bottom navigation
      StatefulShellRoute.indexedStack(
        builder: (ctx, state, shell) => AppNavigation(shell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: RouteConstants.dashboard,
              builder: (_, __) => const DashboardScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: RouteConstants.transactions,
              builder: (_, __) => const TransactionsScreen(),
              routes: [
                GoRoute(
                  path: 'add',
                  builder: (_, __) => const AddTransactionScreen(),
                ),
                GoRoute(
                  path: ':id',
                  builder: (ctx, state) => TransactionDetailScreen(
                    id: state.pathParameters['id']!,
                  ),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: RouteConstants.calendar,
              builder: (_, __) => const CalendarScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: RouteConstants.reports,
              builder: (_, __) => const ReportsScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: RouteConstants.profile,
              builder: (_, __) => const ProfileScreen(),
              routes: [
                GoRoute(path: 'settings', builder: (_, __) => const SettingsScreen()),
                GoRoute(path: 'security', builder: (_, __) => const SecurityScreen()),
                GoRoute(path: 'backup', builder: (_, __) => const BackupScreen()),
                GoRoute(path: 'categories', builder: (_, __) => const CategoriesScreen()),
                GoRoute(path: 'accounts', builder: (_, __) => const AccountsScreen()),
                GoRoute(path: 'cards', builder: (_, __) => const CreditCardsScreen()),
                GoRoute(path: 'goals', builder: (_, __) => const GoalsScreen()),
                GoRoute(path: 'budget', builder: (_, __) => const BudgetScreen()),
                GoRoute(path: 'statistics', builder: (_, __) => const StatisticsScreen()),
                GoRoute(path: 'simulator', builder: (_, __) => const SimulatorScreen()),
                GoRoute(path: 'bills', builder: (_, __) => const BillsScreen()),
              ],
            ),
          ]),
        ],
      ),
    ],
  );
});
