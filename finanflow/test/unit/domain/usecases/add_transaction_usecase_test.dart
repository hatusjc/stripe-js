import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:finanflow/domain/entities/transaction_entity.dart';
import 'package:finanflow/domain/entities/installment_entity.dart';
import 'package:finanflow/domain/repositories/i_transaction_repository.dart';
import 'package:finanflow/domain/usecases/transactions/add_transaction_usecase.dart';
import 'package:finanflow/core/utils/either.dart';
import 'package:finanflow/core/error/failures.dart';

class MockTransactionRepository extends Mock implements ITransactionRepository {}

TransactionEntity _validTxn() => TransactionEntity(
      id: 'test-id', userId: 'u1', categoryId: 'cat1',
      accountId: 'acc1', type: TransactionType.expense,
      amountCents: 5000, date: DateTime.now(),
      status: TransactionStatus.confirmed, isRecurring: false,
      createdAt: DateTime.now(), updatedAt: DateTime.now(),
    );

void main() {
  late AddTransactionUseCase useCase;
  late MockTransactionRepository mockRepo;

  setUp(() {
    mockRepo = MockTransactionRepository();
    useCase = AddTransactionUseCase(mockRepo);
    registerFallbackValue(_validTxn());
  });

  test('returns Right(transaction) when valid', () async {
    final txn = _validTxn();
    when(() => mockRepo.add(any())).thenAnswer((_) async => Right(txn));

    final result = await useCase.call(txn);

    expect(result.isRight, isTrue);
    expect(result.right.id, txn.id);
    verify(() => mockRepo.add(any())).called(1);
  });

  test('returns Left(ValidationFailure) when amount is zero', () async {
    final txn = _validTxn().copyWith(amountCents: 0);

    final result = await useCase.call(txn);

    expect(result.isLeft, isTrue);
    expect(result.left, isA<ValidationFailure>());
    verifyNever(() => mockRepo.add(any()));
  });

  test('returns Left when no account or credit card', () async {
    final txn = TransactionEntity(
      id: 'test', userId: 'u1', categoryId: 'cat',
      type: TransactionType.expense, amountCents: 1000,
      date: DateTime.now(), status: TransactionStatus.confirmed,
      isRecurring: false, createdAt: DateTime.now(), updatedAt: DateTime.now(),
    );

    final result = await useCase.call(txn);

    expect(result.isLeft, isTrue);
    verifyNever(() => mockRepo.add(any()));
  });

  test('returns Left when category is empty', () async {
    final txn = TransactionEntity(
      id: 'test', userId: 'u1', categoryId: '', accountId: 'acc1',
      type: TransactionType.expense, amountCents: 1000,
      date: DateTime.now(), status: TransactionStatus.confirmed,
      isRecurring: false, createdAt: DateTime.now(), updatedAt: DateTime.now(),
    );

    final result = await useCase.call(txn);

    expect(result.isLeft, isTrue);
  });
}
