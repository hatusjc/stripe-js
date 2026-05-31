import 'package:sqflite/sqflite.dart';
import '../../domain/entities/bill_entity.dart';
import '../../domain/repositories/i_bill_repository.dart';
import '../../core/error/failures.dart';
import '../../core/utils/either.dart';
import '../../core/extensions/datetime_extension.dart';
import '../datasources/local/database_helper.dart';
import '../models/bill_model.dart';

class BillRepositoryImpl implements IBillRepository {
  BillRepositoryImpl(this._dbHelper);
  final DatabaseHelper _dbHelper;

  @override
  Future<Either<Failure, List<BillEntity>>> getAll(String userId) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'bills',
        where: 'user_id = ? AND deleted_at IS NULL',
        whereArgs: [userId],
        orderBy: 'due_date ASC',
      );
      return Right(rows.map(BillModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get bills: $e'));
    }
  }

  @override
  Future<Either<Failure, List<BillEntity>>> getPending(String userId) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'bills',
        where:
            "user_id = ? AND deleted_at IS NULL AND status IN ('pending', 'overdue')",
        whereArgs: [userId],
        orderBy: 'due_date ASC',
      );
      return Right(rows.map(BillModel.fromMap).toList());
    } catch (e) {
      return Left(DatabaseFailure('Failed to get pending bills: $e'));
    }
  }

  @override
  Future<Either<Failure, BillEntity?>> getById(String id) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'bills',
        where: 'id = ? AND deleted_at IS NULL',
        whereArgs: [id],
        limit: 1,
      );
      if (rows.isEmpty) return const Right(null);
      return Right(BillModel.fromMap(rows.first));
    } catch (e) {
      return Left(DatabaseFailure('Failed to get bill: $e'));
    }
  }

  @override
  Future<Either<Failure, BillEntity>> create(BillEntity bill) async {
    try {
      final db = await _dbHelper.database;
      await db.insert(
        'bills',
        BillModel.fromEntity(bill).toMap(),
        conflictAlgorithm: ConflictAlgorithm.fail,
      );
      return Right(bill);
    } catch (e) {
      return Left(DatabaseFailure('Failed to create bill: $e'));
    }
  }

  @override
  Future<Either<Failure, BillEntity>> save(BillEntity bill) async {
    try {
      final db = await _dbHelper.database;
      await db.update(
        'bills',
        BillModel.fromEntity(bill).toMap(),
        where: 'id = ?',
        whereArgs: [bill.id],
      );
      return Right(bill);
    } catch (e) {
      return Left(DatabaseFailure('Failed to update bill: $e'));
    }
  }

  @override
  Future<Either<Failure, BillEntity>> markAsPaid(
      String id, DateTime paidAt) async {
    try {
      final db = await _dbHelper.database;
      final rows = await db.query(
        'bills',
        where: 'id = ?',
        whereArgs: [id],
        limit: 1,
      );
      if (rows.isEmpty) return Left(NotFoundFailure('Bill not found'));

      final bill = BillModel.fromMap(rows.first);
      final newStatus = bill.type == BillType.payable
          ? BillStatus.paid
          : BillStatus.received;
      final now = DateTime.now();

      await db.update(
        'bills',
        {
          'status': newStatus.name,
          'paid_at': paidAt.millisecondsSinceEpochUtc,
          'updated_at': now.millisecondsSinceEpochUtc,
        },
        where: 'id = ?',
        whereArgs: [id],
      );

      return Right(bill.copyWith(
        status: newStatus,
        paidAt: paidAt,
        updatedAt: now,
      ));
    } catch (e) {
      return Left(DatabaseFailure('Failed to mark bill as paid: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> delete(String id) async {
    try {
      final db = await _dbHelper.database;
      await db.update(
        'bills',
        {'deleted_at': DateTime.now().millisecondsSinceEpochUtc},
        where: 'id = ?',
        whereArgs: [id],
      );
      return const Right(null);
    } catch (e) {
      return Left(DatabaseFailure('Failed to delete bill: $e'));
    }
  }
}
