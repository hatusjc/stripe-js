import 'dart:async';
import 'package:sqflite/sqflite.dart';
import '../../domain/entities/account_entity.dart';
import '../../domain/entities/transaction_entity.dart';
import '../../domain/repositories/i_account_repository.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../core/extensions/datetime_extension.dart';
import '../datasources/local/database_helper.dart';
import '../models/account_model.dart';
import '../models/transaction_model.dart';

class AccountRepositoryImpl implements IAccountRepository {
  AccountRepositoryImpl(this._dbHelper);
  final DatabaseHelper _dbHelper;

  final _controllers = <String, StreamController<List<AccountEntity>>>{};

  @override
  Future<Either<Failure, List<AccountEntity>>> getAll(String userId) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'accounts',
        where: 'user_id = ? AND deleted_at IS NULL AND is_active = 1',
        whereArgs: [userId],
        orderBy: 'sort_order ASC, name ASC',
      );
      return Right(rows.map(AccountModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get accounts: $e'));
    }
  }

  @override
  Future<Either<Failure, AccountEntity?>> getById(String id) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'accounts',
        where: 'id = ? AND deleted_at IS NULL',
        whereArgs: [id],
        limit: 1,
      );
      if (rows.isEmpty) return const Right(null);
      return Right(AccountModel.fromMap(rows.first));
    } catch (e) {
      return Left(DatabaseFailure('Failed to get account: $e'));
    }
  }

  @override
  Future<Either<Failure, AccountEntity>> create(AccountEntity account) async {
    try {
      final db = await _dbHelper.database;
      await db.insert(
        'accounts',
        AccountModel.fromEntity(account).toMap(),
        conflictAlgorithm: ConflictAlgorithm.fail,
      );
      _notifyWatchers(account.userId);
      return Right(account);
    } catch (e) {
      return Left(DatabaseFailure('Failed to create account: $e'));
    }
  }

  @override
  Future<Either<Failure, AccountEntity>> update(AccountEntity account) async {
    try {
      final db = await _dbHelper.database;
      await db.update(
        'accounts',
        AccountModel.fromEntity(account).toMap(),
        where: 'id = ?',
        whereArgs: [account.id],
      );
      _notifyWatchers(account.userId);
      return Right(account);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update account: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query('accounts', where: 'id = ?', whereArgs: [id], limit: 1);
      if (rows.isEmpty) return const Right(null);
      final userId = rows.first['user_id'] as String;
      await db.update(
        'accounts',
        {'deleted_at': DateTime.now().millisecondsSinceEpochUtc},
        where: 'id = ?',
        whereArgs: [id],
      );
      _notifyWatchers(userId);
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure('Failed to delete account: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> transfer({
    required String fromAccountId,
    required String toAccountId,
    required int amountCents,
    required String categoryId,
    required String userId,
    required DateTime date,
    String? description,
  }) async {
    try {
      final db = await _dbHelper.database;
      await db.transaction((txn) async {
        final now = DateTime.now();
        final ms = now.millisecondsSinceEpoch;
        final fromTxnId = '${userId}_tf_from_$ms';
        final toTxnId = '${userId}_tf_to_$ms';

        final fromTxn = TransactionModel.fromEntity(TransactionEntity(
          id: fromTxnId,
          userId: userId,
          categoryId: categoryId,
          accountId: fromAccountId,
          type: TransactionType.transfer,
          amountCents: amountCents,
          date: date,
          description: description,
          transferId: toTxnId,
          status: TransactionStatus.confirmed,
          isRecurring: false,
          createdAt: now,
          updatedAt: now,
        ));

        final toTxn = TransactionModel.fromEntity(TransactionEntity(
          id: toTxnId,
          userId: userId,
          categoryId: categoryId,
          accountId: toAccountId,
          type: TransactionType.transfer,
          amountCents: amountCents,
          date: date,
          description: description,
          transferId: fromTxnId,
          status: TransactionStatus.confirmed,
          isRecurring: false,
          createdAt: now,
          updatedAt: now,
        ));

        await txn.insert('transactions', fromTxn.toMap());
        await txn.insert('transactions', toTxn.toMap());

        await txn.rawUpdate(
          'UPDATE accounts SET current_balance = current_balance - ?, updated_at = ? WHERE id = ?',
          [amountCents, now.millisecondsSinceEpochUtc, fromAccountId],
        );
        await txn.rawUpdate(
          'UPDATE accounts SET current_balance = current_balance + ?, updated_at = ? WHERE id = ?',
          [amountCents, now.millisecondsSinceEpochUtc, toAccountId],
        );
      });
      _notifyWatchers(userId);
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure('Failed to transfer: $e'));
    }
  }

  @override
  Stream<List<AccountEntity>> watchAll(String userId) {
    final controller = _controllers.putIfAbsent(
      userId,
      () => StreamController<List<AccountEntity>>.broadcast(),
    );

    getAll(userId).then((result) {
      result.fold((_) => controller.add([]), (list) => controller.add(list));
    });

    return controller.stream;
  }

  void _notifyWatchers(String userId) {
    getAll(userId).then((result) {
      result.fold((_) {}, (list) => _controllers[userId]?.add(list));
    });
  }
}
