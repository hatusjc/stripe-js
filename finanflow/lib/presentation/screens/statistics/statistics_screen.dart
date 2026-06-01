import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/entities/category_entity.dart';
import '../../../domain/entities/transaction_entity.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/category_provider.dart';

class StatisticsScreen extends ConsumerStatefulWidget {
  const StatisticsScreen({super.key});

  @override
  ConsumerState<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends ConsumerState<StatisticsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  int _selectedPieIndex = -1;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final txState = ref.watch(transactionProvider);
    final categoriesAsync = ref.watch(categoriesProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Estatísticas'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [Tab(text: 'Despesas'), Tab(text: 'Receitas')],
        ),
      ),
      body: txState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (state) {
          final categories = categoriesAsync.valueOrNull ?? [];
          return TabBarView(
            controller: _tabs,
            children: [
              _StatsBody(
                transactions: state.transactions.where((t) => t.type == TransactionType.expense).toList(),
                categories: categories,
                type: TransactionType.expense,
                selectedIndex: _selectedPieIndex,
                onSelectPie: (i) => setState(() => _selectedPieIndex = i),
              ),
              _StatsBody(
                transactions: state.transactions.where((t) => t.type == TransactionType.income).toList(),
                categories: categories,
                type: TransactionType.income,
                selectedIndex: _selectedPieIndex,
                onSelectPie: (i) => setState(() => _selectedPieIndex = i),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _StatsBody extends StatelessWidget {
  const _StatsBody({
    required this.transactions,
    required this.categories,
    required this.type,
    required this.selectedIndex,
    required this.onSelectPie,
  });
  final List<TransactionEntity> transactions;
  final List<CategoryEntity> categories;
  final TransactionType type;
  final int selectedIndex;
  final void Function(int) onSelectPie;

  @override
  Widget build(BuildContext context) {
    if (transactions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.bar_chart, size: 64, color: Colors.grey),
            const SizedBox(height: 12),
            Text('Sem ${type == TransactionType.expense ? 'despesas' : 'receitas'} no período',
                style: const TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    final byCategory = <String, int>{};
    for (final t in transactions) {
      byCategory[t.categoryId] = (byCategory[t.categoryId] ?? 0) + t.amountCents;
    }
    final sorted = byCategory.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    final total = sorted.fold(0, (s, e) => s + e.value);
    final palette = AppColors.chartPalette;

    final sections = sorted.asMap().entries.map((entry) {
      final i = entry.key;
      final e = entry.value;
      final pct = total > 0 ? e.value / total : 0.0;
      final isTouched = selectedIndex == i;
      return PieChartSectionData(
        value: e.value.toDouble(),
        color: palette[i % palette.length],
        radius: isTouched ? 60 : 50,
        title: pct > 0.05 ? '${(pct * 100).toStringAsFixed(0)}%' : '',
        titleStyle: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
      );
    }).toList();

    final dailyTotals = <DateTime, int>{};
    for (final t in transactions) {
      final day = DateTime(t.date.year, t.date.month, t.date.day);
      dailyTotals[day] = (dailyTotals[day] ?? 0) + t.amountCents;
    }
    final days = dailyTotals.keys.toList()..sort();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _SectionTitle('Distribuição por categoria'),
        const SizedBox(height: 8),
        SizedBox(
          height: 220,
          child: Row(
            children: [
              Expanded(
                flex: 3,
                child: PieChart(
                  PieChartData(
                    sections: sections,
                    centerSpaceRadius: 40,
                    sectionsSpace: 2,
                    pieTouchData: PieTouchData(
                      touchCallback: (event, response) {
                        if (response?.touchedSection != null) {
                          onSelectPie(response!.touchedSection!.touchedSectionIndex);
                        }
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: sorted.asMap().entries.take(5).map((entry) {
                    final i = entry.key;
                    final e = entry.value;
                    final cat = categories.cast<CategoryEntity?>().firstWhere(
                        (c) => c?.id == e.key, orElse: () => null);
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          Container(width: 10, height: 10, decoration: BoxDecoration(color: palette[i % palette.length], shape: BoxShape.circle)),
                          const SizedBox(width: 4),
                          Expanded(child: Text(cat?.name ?? e.key.substring(0, 4), style: const TextStyle(fontSize: 11), overflow: TextOverflow.ellipsis)),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _SectionTitle('Top categorias'),
        const SizedBox(height: 8),
        ...sorted.take(5).toList().asMap().entries.map((entry) {
          final i = entry.key;
          final e = entry.value;
          final cat = categories.cast<CategoryEntity?>().firstWhere((c) => c?.id == e.key, orElse: () => null);
          final pct = total > 0 ? e.value / total : 0.0;
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(children: [
                        Container(width: 12, height: 12, decoration: BoxDecoration(color: palette[i % palette.length], shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        Text(cat?.name ?? 'Categoria', style: const TextStyle(fontWeight: FontWeight.w600)),
                      ]),
                      Text(_fmt(e.value), style: TextStyle(fontWeight: FontWeight.bold, color: type == TransactionType.expense ? Colors.red : Colors.green)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: pct,
                      minHeight: 6,
                      backgroundColor: palette[i % palette.length].withAlpha(40),
                      valueColor: AlwaysStoppedAnimation(palette[i % palette.length]),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text('${(pct * 100).toStringAsFixed(1)}% do total', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
            ),
          );
        }),
        if (days.length > 1) ...[
          const SizedBox(height: 16),
          _SectionTitle('Evolução no período'),
          const SizedBox(height: 8),
          SizedBox(
            height: 160,
            child: BarChart(
              BarChartData(
                barGroups: days.asMap().entries.map((entry) => BarChartGroupData(
                  x: entry.key,
                  barRods: [BarChartRodData(
                    toY: (dailyTotals[entry.value] ?? 0) / 100,
                    color: type == TransactionType.expense ? Colors.red.shade300 : Colors.green.shade400,
                    width: 8,
                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(4), topRight: Radius.circular(4)),
                  )],
                )).toList(),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                titlesData: const FlTitlesData(show: false),
                barTouchData: BarTouchData(
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipItem: (group, gi, rod, ri) => BarTooltipItem(
                      _fmt((rod.toY * 100).round()),
                      const TextStyle(color: Colors.white, fontSize: 11),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
        const SizedBox(height: 16),
        _SummaryRow(label: 'Total no período', value: _fmt(total), color: type == TransactionType.expense ? Colors.red : Colors.green),
        _SummaryRow(label: 'Média por dia', value: _fmt(days.isNotEmpty ? total ~/ days.length : 0), color: Colors.grey),
        _SummaryRow(label: 'Transações', value: '${transactions.length}', color: Colors.grey),
      ],
    );
  }

  String _fmt(int cents) => 'R\$ ${(cents / 100).toStringAsFixed(2).replaceAll('.', ',')}';
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Theme.of(context).colorScheme.primary));
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value, required this.color});
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
