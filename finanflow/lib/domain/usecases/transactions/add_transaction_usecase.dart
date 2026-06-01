import '../../entities/transaction_entity.dart';
import '../../repositories/i_transaction_repository.dart';
import '../../../core/error/failures.dart';
import '../../../core/utils/either.dart';

class AddTransactionUseCase {
  const AddTransactionUseCase(this._repository);
  final ITransactionRepository _repository;

  Future<Either<Failure, TransactionEntity>> call(TransactionEntity transaction) async {
    if (transaction.amountCents <= 0) {
      return Left(const ValidationFailure('Amount must be greater than zero'));
    }
    if (transaction.categoryId.isEmpty) {
      return Left(const ValidationFailure('Category is required'));
    }
    if (transaction.accountId == null && transaction.creditCardId == null) {
      return Left(const ValidationFailure('Account or credit card is required'));
    }
    return _repository.add(transaction);
  }
}
