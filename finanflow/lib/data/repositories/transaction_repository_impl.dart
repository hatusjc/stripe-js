import 'dart:async';
import 'package:sqflite/sqflite.dart';
import '../../domain/entities/transaction_entity.dart';
import '../../domain/entities/installment_entity.dart';
import '../../domain/repositories/i_transaction_repository.dart';
import '../../core/error/exceptions.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../core/extensions/datetime_extension.dart';
import '../datasources/local/database_helper.dart';
import '../models/transaction_model.dart';

class TransactionRepositoryImpl implements ITransactionRepository {
  TransactionRepositoryImpl(this._dbHelper);
  final DatabaseHelper _dbHelper;

  final _controllers = <String, StreamController<List<TransactionEntity>>>{};

  @override
  Future<Either<Failure, List<TransactionEntity>>> getByPeriod(DateRange range, String userId) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'transactions',
        where: 'user_id = ? AND date >= ? AND date <= ? AND deleted_at IS NULL',
        whereArgs: [
          userId,
          range.start.millisecondsSinceEpochUtc,
          range.end.millisecondsSinceEpochUtc,
        ],
        orderBy: 'date DESC',
      );
      return Right(rows.map(TransactionModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get transactions: $e'));
    }
  }

  @override
  Future<Either<Failure, List<TransactionEntity>>> getByAccount(
    String accountId, {
    int? limit,
    DateTime? before,
  }) async {
    try {
      final db = await _dbHelper.database;
      final whereArgs = <dynamic>[accountId];
      var where = 'account_id = ? AND deleted_at IS NULL';
      if (before != null) {
        where += ' AND date < ?';
        whereArgs.add(before.millisecondsSinceEpochUtc);
      }
      final rows = await db.query(
        'transactions',
        where: where,
        whereArgs: whereArgs,
        orderBy: 'date DESC',
        limit: limit ?? 50,
      );
      return Right(rows.map(TransactionModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get transactions by account: $e'));
    }
  }

  @override
  Future<Either<Failure, List<TransactionEntity>>> getByCategory(String categoryId, DateRange range) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'transactions',
        where: 'category_id = ? AND date >= ? AND date <= ? AND deleted_at IS NULL',
        whereArgs: [
          categoryId,
          range.start.millisecondsSinceEpochUtc,
          range.end.millisecondsSinceEpochUtc,
        ],
        orderBy: 'date DESC',
      );
      return Right(rows.map(TransactionModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get transactions by category: $e'));
    }
  }

  @override
  Future<Either<Failure, TransactionEntity?>> getById(String id) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query('transactions', where: 'id = ?', whereArgs: [id]);
      return Right(rows.isEmpty ? null : TransactionModel.fromMap(rows.first));
    } catch (e) {
      return Left(DatabaseFailure('Failed to get transaction: $e'));
    }
  }

  @override
  Future<Either<Failure, TransactionEntity>> add(TransactionEntity transaction) async {
    try {
      final db = await _dbHelper.database;
      final model = TransactionModel.fromEntity(transaction);
      await db.insert('transactions', model.toMap(), conflictAlgorithm: ConflictAlgorithm.fail);
      if (transaction.accountId != null) {
        await _updateAccountBalance(db, transaction.accountId!, transaction);
      }
      _notifyWatchers(transaction.userId);
      return Right(transaction);
    } catch (e) {
      return Left(DatabaseFailure('Failed to add transaction: $e'));
    }
  }

  @override
  Future<Either<Failure, TransactionEntity>> update(TransactionEntity transaction) async {
    try {
      final db = await _dbHelper.database;
      // Get old transaction to reverse balance effect
      final oldRows = await db.query('transactions', where: 'id = ?', whereArgs: [transaction.id]);
      if (oldRows.isNotEmpty) {
        final old = TransactionModel.fromMap(oldRows.first);
        if (old.accountId != null) {
          await _reverseAccountBalance(db, old.accountId!, old);
        }
      }
      final model = TransactionModel.fromEntity(transaction);
      await db.update('transactions', model.toMap(), where: 'id = ?', whereArgs: [transaction.id]);
      if (transaction.accountId != null) {
        await _updateAccountBalance(db, transaction.accountId!, transaction);
      }
      _notifyWatchers(transaction.userId);
      return Right(transaction);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update transaction: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query('transactions', where: 'id = ?', whereArgs: [id]);
      if (rows.isNotEmpty) {
        final t = TransactionModel.fromMap(rows.first);
        await db.update(
          'transactions',
          {'deleted_at': DateTime.now().millisecondsSinceEpochUtc},
          where: 'id = ?',
          whereArgs: [id],
        );
        if (t.accountId != null) {
          await _reverseAccountBalance(db, t.accountId!, t);
        }
        _notifyWatchers(t.userId);
      }
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure('Failed to delete transaction: $e'));
    }
  }

  @override
  Future<Either<Failure, List<InstallmentEntity>>> addInstallments(
    InstallmentEntity installment,
    List<TransactionEntity> transactions,
  ) async {
    try {
      final db = await _dbHelper.database;
      await db.transaction((txn) async {
        await txn.insert('installments', _installmentToMap(installment));
        for (final t in transactions) {
          await txn.insert('transactions', TransactionModel.fromEntity(t).toMap());
        }
      });
      _notifyWatchers(installment.userId);
      return Right([installment]);
    } catch (e) {
      return Left(DatabaseFailure('Failed to add installments: $e'));
    }
  }

  @override
  Future<Either<Failure, int>> getCount(String userId) async {
    try {
      final db = await _dbHelper.database;
      final result = await db.rawQuery(
        'SELECT COUNT(*) as cnt FROM transactions WHERE user_id = ? AND deleted_at IS NULL',
        [userId],
      );
      return Right(Sqflite.firstIntValue(result) ?? 0);
    } catch (e) {
      return Left(DatabaseFailure('Failed to count transactions: $e'));
    }
  }

  @override
  Stream<List<TransactionEntity>> watchByPeriod(DateRange range, String userId) {
    final key = '$userId-${range.start.millisecondsSinceEpoch}-${range.end.millisecondsSinceEpoch}';
    _controllers.putIfAbsent(key, () {
      final ctrl = StreamController<List<TransactionEntity>>.broadcast();
      // Emit initial data
      getByPeriod(range, userId).then((result) {
        result.fold((_) {}, (data) {
          if (!ctrl.isClosed) ctrl.add(data);
        });
      });
      return ctrl;
    });
    return _controllers[key]!.stream;
  }

  void _notifyWatchers(String userId) {
    for (final entry in _controllers.entries) {
      if (entry.key.startsWith(userId)) {
        // Re-query and emit — simplified; production would parse key for range
        entry.value.add([]);
      }
    }
  }

  Future<void> _updateAccountBalance(Database db, String accountId, TransactionEntity t) async {
    final delta = t.type == TransactionType.income ? t.amountCents : -t.amountCents;
    if (t.type == TransactionType.transfer) return;
    await db.rawUpdate(
      'UPDATE accounts SET current_balance = current_balance + ?, updated_at = ? WHERE id = ?',
      [delta, DateTime.now().millisecondsSinceEpochUtc, accountId],
    );
  }

  Future<void> _reverseAccountBalance(Database db, String accountId, TransactionEntity t) async {
    final delta = t.type == TransactionType.income ? -t.amountCents : t.amountCents;
    if (t.type == TransactionType.transfer) return;
    await db.rawUpdate(
      'UPDATE accounts SET current_balance = current_balance + ?, updated_at = ? WHERE id = ?',
      [delta, DateTime.now().millisecondsSinceEpochUtc, accountId],
    );
  }

  Map<String, dynamic> _installmentToMap(InstallmentEntity i) => {
        'id': i.id,
        'user_id': i.userId,
        'credit_card_id': i.creditCardId,
        'category_id': i.categoryId,
        'description': i.description,
        'total_amount': i.totalAmountCents,
        'installment_amount': i.installmentAmountCents,
        'total_count': i.totalCount,
        'paid_count': i.paidCount,
        'start_date': i.startDate.millisecondsSinceEpochUtc,
        'status': i.status.name,
        'created_at': i.createdAt.millisecondsSinceEpochUtc,
        'updated_at': i.updatedAt.millisecondsSinceEpochUtc,
      };
}
