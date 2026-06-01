import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../domain/entities/transaction_entity.dart';
import '../../../domain/repositories/i_transaction_repository.dart';
import '../../providers/transaction_provider.dart';

class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  CalendarFormat _format = CalendarFormat.month;

  @override
  void initState() {
    super.initState();
    _updateRange(_focusedDay);
  }

  void _updateRange(DateTime month) {
    ref.read(currentDateRangeProvider.notifier).state = DateRange(
      start: DateTime(month.year, month.month, 1),
      end: DateTime(month.year, month.month + 1, 0, 23, 59, 59),
    );
  }

  @override
  Widget build(BuildContext context) {
    final txState = ref.watch(transactionProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Calendário')),
      body: txState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (state) {
          final transactions = state.transactions;
          final eventMap = _buildEventMap(transactions);
          final selectedTxns = _transactionsForDay(_selectedDay, transactions);

          return Column(
            children: [
              RepaintBoundary(
                child: TableCalendar<TransactionEntity>(
                  firstDay: DateTime(2020),
                  lastDay: DateTime(2100),
                  focusedDay: _focusedDay,
                  selectedDayPredicate: (d) => isSameDay(d, _selectedDay),
                  calendarFormat: _format,
                  eventLoader: (d) => eventMap[_normalize(d)] ?? [],
                  onDaySelected: (selected, focused) {
                    setState(() {
                      _selectedDay = selected;
                      _focusedDay = focused;
                    });
                  },
                  onFormatChanged: (f) => setState(() => _format = f),
                  onPageChanged: (focused) {
                    _focusedDay = focused;
                    _updateRange(focused);
                  },
                  calendarBuilders: CalendarBuilders(
                    markerBuilder: (ctx, day, events) {
                      if (events.isEmpty) return const SizedBox.shrink();
                      final hasIncome = events.any((e) => e.type == TransactionType.income);
                      final hasExpense = events.any((e) => e.type == TransactionType.expense);
                      return Positioned(
                        bottom: 2,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (hasIncome) _dot(Colors.green),
                            if (hasIncome && hasExpense) const SizedBox(width: 2),
                            if (hasExpense) _dot(Colors.red),
                          ],
                        ),
                      );
                    },
                  ),
                  headerStyle: const HeaderStyle(
                    formatButtonVisible: true,
                    titleCentered: true,
                  ),
                  calendarStyle: CalendarStyle(
                    todayDecoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primaryContainer,
                      shape: BoxShape.circle,
                    ),
                    selectedDecoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary,
                      shape: BoxShape.circle,
                    ),
                    markersMaxCount: 2,
                  ),
                ),
              ),
              _DaySummary(transactions: selectedTxns),
              const Divider(height: 1),
              Expanded(
                child: selectedTxns.isEmpty
                    ? const Center(
                        child: Text('Sem transações neste dia', style: TextStyle(color: Colors.grey)),
                      )
                    : ListView.builder(
                        itemCount: selectedTxns.length,
                        itemBuilder: (ctx, i) => _TransactionItem(transaction: selectedTxns[i]),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _dot(Color color) => Container(
        width: 6,
        height: 6,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      );

  DateTime _normalize(DateTime d) => DateTime(d.year, d.month, d.day);

  Map<DateTime, List<TransactionEntity>> _buildEventMap(List<TransactionEntity> txns) {
    final map = <DateTime, List<TransactionEntity>>{};
    for (final t in txns) {
      final key = _normalize(t.date);
      map.putIfAbsent(key, () => []).add(t);
    }
    return map;
  }

  List<TransactionEntity> _transactionsForDay(DateTime day, List<TransactionEntity> txns) {
    final key = _normalize(day);
    return txns.where((t) => _normalize(t.date) == key).toList()
      ..sort((a, b) => b.date.compareTo(a.date));
  }
}

class _DaySummary extends StatelessWidget {
  const _DaySummary({required this.transactions});
  final List<TransactionEntity> transactions;

  @override
  Widget build(BuildContext context) {
    final income = transactions
        .where((t) => t.type == TransactionType.income)
        .fold(0, (s, t) => s + t.amountCents);
    final expense = transactions
        .where((t) => t.type == TransactionType.expense)
        .fold(0, (s, t) => s + t.amountCents);
    final balance = income - expense;

    String fmt(int cents) {
      final v = cents.abs() / 100;
      return 'R\$ ${v.toStringAsFixed(2).replaceAll('.', ',')}';
    }

    return Container(
      color: Theme.of(context).colorScheme.surfaceContainerLow,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      child: Row(
        children: [
          _SummaryItem(label: 'Receitas', value: fmt(income), color: Colors.green),
          const SizedBox(width: 16),
          _SummaryItem(label: 'Despesas', value: fmt(expense), color: Colors.red),
          const SizedBox(width: 16),
          _SummaryItem(
            label: 'Saldo',
            value: '${balance < 0 ? '-' : ''}${fmt(balance)}',
            color: balance >= 0 ? Colors.blue : Colors.red,
          ),
        ],
      ),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  const _SummaryItem({required this.label, required this.value, required this.color});
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

class _TransactionItem extends StatelessWidget {
  const _TransactionItem({required this.transaction});
  final TransactionEntity transaction;

  @override
  Widget build(BuildContext context) {
    final isIncome = transaction.type == TransactionType.income;
    final isTransfer = transaction.type == TransactionType.transfer;
    final color = isTransfer ? Colors.blue : (isIncome ? Colors.green : Colors.red);
    final sign = isIncome ? '+' : (isTransfer ? '↔' : '-');
    final amount = transaction.amountCents / 100;

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withOpacity(0.1),
        child: Icon(
          isTransfer ? Icons.swap_horiz : (isIncome ? Icons.arrow_downward : Icons.arrow_upward),
          color: color,
          size: 18,
        ),
      ),
      title: Text(
        transaction.description ?? (isIncome ? 'Receita' : (isTransfer ? 'Transferência' : 'Despesa')),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Text(
        '${transaction.date.hour.toString().padLeft(2, '0')}:${transaction.date.minute.toString().padLeft(2, '0')}',
        style: const TextStyle(fontSize: 11),
      ),
      trailing: Text(
        '$sign R\$ ${amount.toStringAsFixed(2).replaceAll('.', ',')}',
        style: TextStyle(fontWeight: FontWeight.bold, color: color),
      ),
    );
  }
}
