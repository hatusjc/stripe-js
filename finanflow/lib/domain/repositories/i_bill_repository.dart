import '../entities/bill_entity.dart';
import '../../core/utils/either.dart';
import '../../core/error/failures.dart';

abstract interface class IBillRepository {
  Future<Either<Failure, List<BillEntity>>> getAll(String userId);
  Future<Either<Failure, List<BillEntity>>> getPending(String userId);
  Future<Either<Failure, BillEntity?>> getById(String id);
  Future<Either<Failure, BillEntity>> create(BillEntity bill);
  Future<Either<Failure, BillEntity>> save(BillEntity bill);
  Future<Either<Failure, BillEntity>> markAsPaid(String id, DateTime paidAt);
  Future<Either<Failure, void>> delete(String id);
}
