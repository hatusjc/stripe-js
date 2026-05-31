import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import '../../core/services/encryption_service.dart';
import '../../core/services/biometric_service.dart';
import '../../core/services/feature_gate_service.dart';
import '../../data/datasources/local/database_helper.dart';
import '../../data/repositories/user_repository_impl.dart';
import '../../data/repositories/transaction_repository_impl.dart';
import '../../domain/entities/plan_entity.dart';
import 'settings_provider.dart';

// Infrastructure singletons
final secureStorageProvider = Provider<FlutterSecureStorage>(
  (_) => const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  ),
);

final encryptionServiceProvider = Provider<EncryptionService>((ref) {
  return EncryptionService(ref.watch(secureStorageProvider));
});

final biometricServiceProvider = Provider<BiometricService>((ref) {
  return BiometricService(LocalAuthentication(), ref.watch(secureStorageProvider));
});

final databaseProvider = FutureProvider<DatabaseHelper>((ref) async {
  final helper = DatabaseHelper.instance;
  await helper.database;
  final encryption = ref.watch(encryptionServiceProvider);
  await encryption.initialize();
  return helper;
});

// Repositories
final userRepositoryProvider = Provider((ref) {
  return UserRepositoryImpl(DatabaseHelper.instance);
});

final transactionRepositoryProvider = Provider((ref) {
  return TransactionRepositoryImpl(DatabaseHelper.instance);
});

// Feature gate driven by current plan
final featureGateProvider = Provider<FeatureGateService>((ref) {
  final settings = ref.watch(settingsProvider).valueOrNull;
  return FeatureGateService(settings?.plan.type ?? PlanType.free);
});
