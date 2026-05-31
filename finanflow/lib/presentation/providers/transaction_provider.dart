import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/transaction_entity.dart';
import '../../domain/repositories/i_transaction_repository.dart';
import '../../data/repositories/transaction_repository_impl.dart';
import '../../data/datasources/local/database_helper.dart';

class TransactionState {
  const TransactionState({
    this.transactions = const [],
    this.totalIncomeCents = 0,
    this.totalExpenseCents = 0,
    this.activeFilter,
  });

  final List<TransactionEntity> transactions;
  final int totalIncomeCents;
  final int totalExpenseCents;
  final TransactionFilter? activeFilter;

  int get balanceCents => totalIncomeCents - totalExpenseCents;

  TransactionState copyWith({
    List<TransactionEntity>? transactions,
    int? totalIncomeCents,
    int? totalExpenseCents,
    TransactionFilter? activeFilter,
  }) =>
      TransactionState(
        transactions: transactions ?? this.transactions,
        totalIncomeCents: totalIncomeCents ?? this.totalIncomeCents,
        totalExpenseCents: totalExpenseCents ?? this.totalExpenseCents,
        activeFilter: activeFilter ?? this.activeFilter,
      );

  static TransactionState fromList(List<TransactionEntity> txns) {
    final income = txns
        .where((t) => t.type == TransactionType.income)
        .fold(0, (s, t) => s + t.amountCents);
    final expense = txns
        .where((t) => t.type == TransactionType.expense)
        .fold(0, (s, t) => s + t.amountCents);
    return TransactionState(
      transactions: txns,
      totalIncomeCents: income,
      totalExpenseCents: expense,
    );
  }
}

class TransactionFilter {
  const TransactionFilter({
    this.type,
    this.categoryId,
    this.accountId,
    this.dateRange,
    this.searchQuery,
  });
  final TransactionType? type;
  final String? categoryId;
  final String? accountId;
  final DateRange? dateRange;
  final String? searchQuery;
}

final transactionRepositoryProvider = Provider<ITransactionRepository>((ref) {
  return TransactionRepositoryImpl(DatabaseHelper.instance);
});

final currentDateRangeProvider = StateProvider<DateRange>((_) => DateRange.currentMonth());

final transactionProvider = AsyncNotifierProvider<TransactionNotifier, TransactionState>(
  TransactionNotifier.new,
);

class TransactionNotifier extends AsyncNotifier<TransactionState> {
  late ITransactionRepository _repo;

  @override
  Future<TransactionState> build() async {
    _repo = ref.watch(transactionRepositoryProvider);
    return _reload();
  }

  Future<TransactionState> _reload() async {
    final range = ref.read(currentDateRangeProvider);
    // userId handled by auth context — simplified for now
    final userId = 'default';
    final result = await _repo.getByPeriod(range, userId);
    return result.fold(
      (failure) => throw Exception(failure.message),
      (txns) => TransactionState.fromList(txns),
    );
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_reload);
  }

  Future<bool> addTransaction(TransactionEntity transaction) async {
    final result = await _repo.add(transaction);
    return result.fold(
      (_) => false,
      (_) {
        refresh();
        return true;
      },
    );
  }

  Future<bool> updateTransaction(TransactionEntity transaction) async {
    final result = await _repo.update(transaction);
    return result.fold((_) => false, (_) {
      refresh();
      return true;
    });
  }

  Future<bool> deleteTransaction(String id) async {
    final result = await _repo.delete(id);
    return result.fold((_) => false, (_) {
      refresh();
      return true;
    });
  }
}
