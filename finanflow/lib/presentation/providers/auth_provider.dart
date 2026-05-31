import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/local/database_helper.dart';
import '../../data/repositories/user_repository_impl.dart';
import 'core_providers.dart';

export 'core_providers.dart' show encryptionServiceProvider, biometricServiceProvider;

class AuthState {
  const AuthState({
    this.isAuthenticated = false,
    this.onboardingComplete = false,
    this.isLocked = false,
    this.hasPin = false,
    this.biometricAvailable = false,
    this.lastActiveAt,
  });

  final bool isAuthenticated;
  final bool onboardingComplete;
  final bool isLocked;
  final bool hasPin;
  final bool biometricAvailable;
  final DateTime? lastActiveAt;

  AuthState copyWith({
    bool? isAuthenticated,
    bool? onboardingComplete,
    bool? isLocked,
    bool? hasPin,
    bool? biometricAvailable,
    DateTime? lastActiveAt,
  }) =>
      AuthState(
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        onboardingComplete: onboardingComplete ?? this.onboardingComplete,
        isLocked: isLocked ?? this.isLocked,
        hasPin: hasPin ?? this.hasPin,
        biometricAvailable: biometricAvailable ?? this.biometricAvailable,
        lastActiveAt: lastActiveAt ?? this.lastActiveAt,
      );
}

final authProvider = AsyncNotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

class AuthNotifier extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    final encryption = ref.read(encryptionServiceProvider);
    await encryption.initialize();

    final userRepo = UserRepositoryImpl(DatabaseHelper.instance);
    final userResult = await userRepo.getCurrentUser();
    final user = userResult.fold((_) => null, (u) => u);

    final hasPin = await encryption.hasPin();
    final biometricService = ref.read(biometricServiceProvider);
    final biometricAvailable = await biometricService.isAvailable();
    final biometricEnabled = await biometricService.isEnabled();

    bool onboardingComplete = false;
    if (user != null) {
      final settingsRepo = SettingsRepositoryImpl(DatabaseHelper.instance);
      final settingsResult = await settingsRepo.getSettings(user.id);
      settingsResult.fold((_) {}, (s) {
        onboardingComplete = s.onboardingComplete;
      });
    }

    return AuthState(
      isAuthenticated: false,
      onboardingComplete: user != null && onboardingComplete,
      hasPin: hasPin,
      biometricAvailable: biometricAvailable && biometricEnabled,
    );
  }

  void markAuthenticated() {
    state = AsyncData(
      state.valueOrNull?.copyWith(
            isAuthenticated: true,
            lastActiveAt: DateTime.now(),
          ) ??
          const AuthState(isAuthenticated: true),
    );
  }

  void markOnboardingComplete() {
    state = AsyncData(
      state.valueOrNull?.copyWith(onboardingComplete: true) ?? const AuthState(),
    );
  }

  void lock() {
    state = AsyncData(
      state.valueOrNull?.copyWith(isAuthenticated: false, isLocked: true) ??
          const AuthState(),
    );
  }

  void updateLastActive() {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(current.copyWith(lastActiveAt: DateTime.now()));
  }
}
