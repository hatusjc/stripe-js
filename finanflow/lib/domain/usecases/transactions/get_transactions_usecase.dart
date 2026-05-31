import '../../entities/transaction_entity.dart';
import '../../repositories/i_transaction_repository.dart';
import '../../../core/error/failures.dart';
import '../../../core/utils/either.dart';

class GetTransactionsByPeriodUseCase {
  const GetTransactionsByPeriodUseCase(this._repository);
  final ITransactionRepository _repository;

  Future<Either<Failure, List<TransactionEntity>>> call(DateRange range, String userId) =>
      _repository.getByPeriod(range, userId);
}

class DeleteTransactionUseCase {
  const DeleteTransactionUseCase(this._repository);
  final ITransactionRepository _repository;

  Future<Either<Failure, void>> call(String id) => _repository.delete(id);
}

class UpdateTransactionUseCase {
  const UpdateTransactionUseCase(this._repository);
  final ITransactionRepository _repository;

  Future<Either<Failure, TransactionEntity>> call(TransactionEntity transaction) {
    if (transaction.amountCents <= 0) {
      return Future.value(Left(const ValidationFailure('Amount must be greater than zero')));
    }
    return _repository.update(transaction);
  }
}
