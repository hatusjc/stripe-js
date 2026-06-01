import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/settings_entity.dart';
import '../../data/repositories/user_repository_impl.dart';
import '../../data/datasources/local/database_helper.dart';

final settingsProvider = AsyncNotifierProvider<SettingsNotifier, SettingsEntity>(
  SettingsNotifier.new,
);

class SettingsNotifier extends AsyncNotifier<SettingsEntity> {
  late final SettingsRepositoryImpl _repo;

  @override
  Future<SettingsEntity> build() async {
    _repo = SettingsRepositoryImpl(DatabaseHelper.instance);
    // Get current user first
    final userRepo = UserRepositoryImpl(DatabaseHelper.instance);
    final userResult = await userRepo.getCurrentUser();
    return userResult.fold(
      (failure) => throw Exception(failure.message),
      (user) async {
        if (user == null) return SettingsEntity.defaultSettings('default');
        final result = await _repo.getSettings(user.id);
        return result.fold(
          (failure) => throw Exception(failure.message),
          (settings) => settings,
        );
      },
    );
  }

  Future<void> updateSettings(SettingsEntity Function(SettingsEntity) updater) async {
    final current = state.valueOrNull;
    if (current == null) return;
    final updated = updater(current);
    state = AsyncData(updated);
    await _repo.updateSettings(updated);
  }
}
