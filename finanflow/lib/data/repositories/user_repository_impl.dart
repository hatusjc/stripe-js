import 'package:sqflite/sqflite.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/entities/settings_entity.dart';
import '../../domain/repositories/i_user_repository.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../datasources/local/database_helper.dart';
import '../models/user_model.dart';
import '../models/settings_model.dart';

class UserRepositoryImpl implements IUserRepository {
  UserRepositoryImpl(this._dbHelper);
  final DatabaseHelper _dbHelper;

  @override
  Future<Either<Failure, UserEntity>> createUser(UserEntity user) async {
    try {
      final db = await _dbHelper.database;
      await db.insert('users', UserModel.fromEntity(user).toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace);
      return Right(user);
    } catch (e) {
      return Left(DatabaseFailure('Failed to create user: $e'));
    }
  }

  @override
  Future<Either<Failure, UserEntity?>> getCurrentUser() async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query('users', limit: 1, orderBy: 'created_at ASC');
      return Right(rows.isEmpty ? null : UserModel.fromMap(rows.first));
    } catch (e) {
      return Left(DatabaseFailure('Failed to get user: $e'));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> updateUser(UserEntity user) async {
    try {
      final db = await _dbHelper.database;
      await db.update('users', UserModel.fromEntity(user).toMap(),
          where: 'id = ?', whereArgs: [user.id]);
      return Right(user);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update user: $e'));
    }
  }
}

class SettingsRepositoryImpl implements ISettingsRepository {
  SettingsRepositoryImpl(this._dbHelper);
  final DatabaseHelper _dbHelper;

  @override
  Future<Either<Failure, SettingsEntity>> getSettings(String userId) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query('settings', where: 'user_id = ?', whereArgs: [userId]);
      if (rows.isEmpty) {
        final defaults = SettingsEntity.defaultSettings(userId);
        return createSettings(defaults);
      }
      return Right(SettingsModel.fromMap(rows.first));
    } catch (e) {
      return Left(DatabaseFailure('Failed to get settings: $e'));
    }
  }

  @override
  Future<Either<Failure, SettingsEntity>> createSettings(SettingsEntity settings) async {
    try {
      final db = await _dbHelper.database;
      await db.insert('settings', SettingsModel.fromEntity(settings).toMap(),
          conflictAlgorithm: ConflictAlgorithm.replace);
      return Right(settings);
    } catch (e) {
      return Left(DatabaseFailure('Failed to create settings: $e'));
    }
  }

  @override
  Future<Either<Failure, SettingsEntity>> updateSettings(SettingsEntity settings) async {
    try {
      final db = await _dbHelper.database;
      await db.update('settings', SettingsModel.fromEntity(settings).toMap(),
          where: 'id = ?', whereArgs: [settings.id]);
      return Right(settings);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update settings: $e'));
    }
  }
}
