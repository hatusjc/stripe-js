import 'package:uuid/uuid.dart';
import '../../entities/transaction_entity.dart';
import '../../entities/installment_entity.dart';
import '../../repositories/i_transaction_repository.dart';
import '../../../core/error/failures.dart';
import '../../../core/utils/either.dart';

class AddInstallmentTransactionUseCase {
  const AddInstallmentTransactionUseCase(this._repository);
  final ITransactionRepository _repository;
  static const _uuid = Uuid();

  Future<Either<Failure, List<TransactionEntity>>> call({
    required String userId,
    required String categoryId,
    required String? creditCardId,
    required String? accountId,
    required String description,
    required int totalAmountCents,
    required int installmentCount,
    required DateTime startDate,
  }) async {
    if (installmentCount <= 1) {
      return Left(const ValidationFailure('Installment count must be greater than 1'));
    }
    if (totalAmountCents <= 0) {
      return Left(const ValidationFailure('Total amount must be greater than zero'));
    }
    if (creditCardId == null && accountId == null) {
      return Left(const ValidationFailure('Account or credit card is required'));
    }

    final installmentAmountCents = (totalAmountCents / installmentCount).round();
    final installmentId = _uuid.v4();

    final installment = InstallmentEntity(
      id: installmentId,
      userId: userId,
      creditCardId: creditCardId,
      categoryId: categoryId,
      description: description,
      totalAmountCents: totalAmountCents,
      installmentAmountCents: installmentAmountCents,
      totalCount: installmentCount,
      paidCount: 0,
      startDate: startDate,
      status: InstallmentStatus.active,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final now = DateTime.now();
    final transactions = List.generate(installmentCount, (i) {
      final installmentDate = DateTime(startDate.year, startDate.month + i, startDate.day);
      return TransactionEntity(
        id: _uuid.v4(),
        userId: userId,
        accountId: accountId,
        creditCardId: creditCardId,
        categoryId: categoryId,
        type: TransactionType.expense,
        amountCents: installmentAmountCents,
        description: '$description (${i + 1}/$installmentCount)',
        date: installmentDate,
        isRecurring: false,
        installmentId: installmentId,
        installmentNum: i + 1,
        status: i == 0 ? TransactionStatus.pending : TransactionStatus.pending,
        createdAt: now,
        updatedAt: now,
      );
    });

    final result = await _repository.addInstallments(installment, transactions);
    return result.fold(
      (failure) => Left(failure),
      (_) => Right(transactions),
    );
  }
}
