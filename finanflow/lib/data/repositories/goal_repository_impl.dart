import 'package:sqflite/sqflite.dart';
import '../../domain/entities/goal_entity.dart';
import '../../domain/repositories/i_goal_repository.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../core/extensions/datetime_extension.dart';
import '../datasources/local/database_helper.dart';
import '../models/goal_model.dart';

class GoalRepositoryImpl implements IGoalRepository {
  GoalRepositoryImpl(this._db);
  final DatabaseHelper _db;

  @override
  Future<Either<Failure, List<GoalEntity>>> getAll(String userId) async {
    try {
      final db = await _db.database;
      final rows = await db.query(
        'goals',
        where: 'user_id = ? AND deleted_at IS NULL',
        whereArgs: [userId],
        orderBy: 'priority ASC, created_at DESC',
      );
      return Right(rows.map(GoalModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get goals: $e'));
    }
  }

  @override
  Future<Either<Failure, GoalEntity?>> getById(String id) async {
    try {
      final db = await _db.database;
      final rows = await db.query('goals',
          where: 'id = ? AND deleted_at IS NULL', whereArgs: [id], limit: 1);
      if (rows.isEmpty) return const Right(null);
      return Right(GoalModel.fromMap(rows.first));
    } catch (e) {
      return Left(DatabaseFailure('Failed to get goal: $e'));
    }
  }

  @override
  Future<Either<Failure, GoalEntity>> create(GoalEntity goal) async {
    try {
      final db = await _db.database;
      await db.insert('goals', GoalModel.fromEntity(goal).toMap(),
          conflictAlgorithm: ConflictAlgorithm.fail);
      return Right(goal);
    } catch (e) {
      return Left(DatabaseFailure('Failed to create goal: $e'));
    }
  }

  @override
  Future<Either<Failure, GoalEntity>> update(GoalEntity goal) async {
    try {
      final db = await _db.database;
      await db.update('goals', GoalModel.fromEntity(goal).toMap(),
          where: 'id = ?', whereArgs: [goal.id]);
      return Right(goal);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update goal: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      final db = await _db.database;
      await db.update(
        'goals',
        {'deleted_at': DateTime.now().millisecondsSinceEpochUtc},
        where: 'id = ?',
        whereArgs: [id],
      );
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure('Failed to delete goal: $e'));
    }
  }

  @override
  Future<Either<Failure, GoalEntity>> addContribution(
      String goalId, int amountCents) async {
    try {
      final db = await _db.database;
      final rows = await db.query('goals',
          where: 'id = ?', whereArgs: [goalId], limit: 1);
      if (rows.isEmpty) return Left(NotFoundFailure('Goal not found'));

      final goal = GoalModel.fromMap(rows.first);
      final newAmount = goal.currentAmountCents + amountCents;
      final now = DateTime.now();
      final newStatus =
          newAmount >= goal.targetAmountCents ? GoalStatus.completed : goal.status;

      await db.update(
        'goals',
        {
          'current_amount': newAmount,
          'status': newStatus.name,
          'updated_at': now.millisecondsSinceEpochUtc,
        },
        where: 'id = ?',
        whereArgs: [goalId],
      );

      return Right(goal.copyWith(
        currentAmountCents: newAmount,
        status: newStatus,
      ));
    } catch (e) {
      return Left(DatabaseFailure('Failed to add contribution: $e'));
    }
  }
}
