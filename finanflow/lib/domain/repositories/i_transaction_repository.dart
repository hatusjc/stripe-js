import '../entities/transaction_entity.dart';
import '../entities/installment_entity.dart';
import '../../core/utils/either.dart';
import '../../core/error/failures.dart';

class DateRange {
  const DateRange({required this.start, required this.end});
  final DateTime start;
  final DateTime end;

  static DateRange currentMonth() {
    final now = DateTime.now();
    return DateRange(
      start: DateTime(now.year, now.month),
      end: DateTime(now.year, now.month + 1, 0, 23, 59, 59),
    );
  }
}

abstract interface class ITransactionRepository {
  Future<Either<Failure, List<TransactionEntity>>> getByPeriod(DateRange range, String userId);
  Future<Either<Failure, List<TransactionEntity>>> getByAccount(String accountId, {int? limit, DateTime? before});
  Future<Either<Failure, List<TransactionEntity>>> getByCategory(String categoryId, DateRange range);
  Future<Either<Failure, TransactionEntity?>> getById(String id);
  Future<Either<Failure, TransactionEntity>> add(TransactionEntity transaction);
  Future<Either<Failure, TransactionEntity>> update(TransactionEntity transaction);
  Future<Either<Failure, void>> delete(String id);
  Future<Either<Failure, List<InstallmentEntity>>> addInstallments(
    InstallmentEntity installment,
    List<TransactionEntity> transactions,
  );
  Future<Either<Failure, int>> getCount(String userId);
  Stream<List<TransactionEntity>> watchByPeriod(DateRange range, String userId);
}
