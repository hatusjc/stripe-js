import 'package:sqflite/sqflite.dart';
import '../../domain/entities/budget_entity.dart';
import '../../domain/repositories/i_budget_repository.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../core/extensions/datetime_extension.dart';
import '../datasources/local/database_helper.dart';
import '../models/budget_model.dart';

class BudgetRepositoryImpl implements IBudgetRepository {
  BudgetRepositoryImpl(this._db);
  final DatabaseHelper _db;

  @override
  Future<Either<Failure, List<BudgetEntity>>> getActive(String userId) async {
    try {
      final db = await _db.database;
      final rows = await db.query(
        'budgets',
        where: 'user_id = ? AND deleted_at IS NULL AND is_active = 1',
        whereArgs: [userId],
        orderBy: 'created_at DESC',
      );
      return Right(rows.map(BudgetModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get budgets: $e'));
    }
  }

  @override
  Future<Either<Failure, BudgetEntity?>> getById(String id) async {
    try {
      final db = await _db.database;
      final rows = await db.query('budgets',
          where: 'id = ? AND deleted_at IS NULL', whereArgs: [id], limit: 1);
      if (rows.isEmpty) return const Right(null);
      return Right(BudgetModel.fromMap(rows.first));
    } catch (e) {
      return Left(DatabaseFailure('Failed to get budget: $e'));
    }
  }

  @override
  Future<Either<Failure, BudgetEntity>> create(BudgetEntity budget) async {
    try {
      final db = await _db.database;
      await db.insert('budgets', BudgetModel.fromEntity(budget).toMap(),
          conflictAlgorithm: ConflictAlgorithm.fail);
      return Right(budget);
    } catch (e) {
      return Left(DatabaseFailure('Failed to create budget: $e'));
    }
  }

  @override
  Future<Either<Failure, BudgetEntity>> update(BudgetEntity budget) async {
    try {
      final db = await _db.database;
      await db.update('budgets', BudgetModel.fromEntity(budget).toMap(),
          where: 'id = ?', whereArgs: [budget.id]);
      return Right(budget);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update budget: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      final db = await _db.database;
      await db.update(
        'budgets',
        {'deleted_at': DateTime.now().millisecondsSinceEpochUtc},
        where: 'id = ?',
        whereArgs: [id],
      );
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure('Failed to delete budget: $e'));
    }
  }

  /// Returns total spent cents for a budget's category in the given period.
  Future<int> getSpentCents({
    required String userId,
    String? categoryId,
    required DateTime from,
    required DateTime to,
  }) async {
    final db = await _db.database;
    final where = categoryId != null
        ? "user_id = ? AND category_id = ? AND type = 'expense' AND deleted_at IS NULL AND date BETWEEN ? AND ?"
        : "user_id = ? AND type = 'expense' AND deleted_at IS NULL AND date BETWEEN ? AND ?";
    final args = categoryId != null
        ? [userId, categoryId, from.millisecondsSinceEpochUtc, to.millisecondsSinceEpochUtc]
        : [userId, from.millisecondsSinceEpochUtc, to.millisecondsSinceEpochUtc];

    final result = await db.rawQuery(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE $where',
      args,
    );
    return (result.first['total'] as int? ?? 0);
  }
}
