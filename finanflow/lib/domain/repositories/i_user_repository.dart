import '../entities/user_entity.dart';
import '../entities/settings_entity.dart';
import '../../core/utils/either.dart';
import '../../core/error/failures.dart';

abstract interface class IUserRepository {
  Future<Either<Failure, UserEntity>> createUser(UserEntity user);
  Future<Either<Failure, UserEntity?>> getCurrentUser();
  Future<Either<Failure, UserEntity>> updateUser(UserEntity user);
}

abstract interface class ISettingsRepository {
  Future<Either<Failure, SettingsEntity>> getSettings(String userId);
  Future<Either<Failure, SettingsEntity>> createSettings(SettingsEntity settings);
  Future<Either<Failure, SettingsEntity>> updateSettings(SettingsEntity settings);
}
