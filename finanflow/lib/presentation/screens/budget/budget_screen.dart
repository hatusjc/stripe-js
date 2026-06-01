import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/budget_entity.dart';
import '../../providers/budget_provider.dart';
import '../../providers/category_provider.dart';

class BudgetScreen extends ConsumerWidget {
  const BudgetScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(budgetsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Orçamentos')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Novo Orçamento'),
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (summaries) {
          if (summaries.isEmpty) {
            return _EmptyState(onAdd: () => _showForm(context, ref));
          }
          final overBudget = summaries.where((s) => s.isOverBudget).toList();
          final nearAlert = summaries.where((s) => s.isNearAlert && !s.isOverBudget).toList();
          final ok = summaries.where((s) => !s.isNearAlert && !s.isOverBudget).toList();

          return RefreshIndicator(
            onRefresh: () => ref.read(budgetsProvider.notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              children: [
                if (overBudget.isNotEmpty) ...[
                  _SectionHeader(title: 'Estourado (${overBudget.length})', color: Colors.red),
                  const SizedBox(height: 8),
                  ...overBudget.map((s) => _BudgetCard(
                        summary: s,
                        onEdit: () => _showForm(context, ref, existing: s.budget),
                        onDelete: () => _confirmDelete(context, ref, s.budget),
                      )),
                ],
                if (nearAlert.isNotEmpty) ...[
                  if (overBudget.isNotEmpty) const SizedBox(height: 16),
                  _SectionHeader(title: 'Atenção (${nearAlert.length})', color: Colors.orange),
                  const SizedBox(height: 8),
                  ...nearAlert.map((s) => _BudgetCard(
                        summary: s,
                        onEdit: () => _showForm(context, ref, existing: s.budget),
                        onDelete: () => _confirmDelete(context, ref, s.budget),
                      )),
                ],
                if (ok.isNotEmpty) ...[
                  if (overBudget.isNotEmpty || nearAlert.isNotEmpty) const SizedBox(height: 16),
                  _SectionHeader(title: 'No prazo (${ok.length})', color: Colors.green),
                  const SizedBox(height: 8),
                  ...ok.map((s) => _BudgetCard(
                        summary: s,
                        onEdit: () => _showForm(context, ref, existing: s.budget),
                        onDelete: () => _confirmDelete(context, ref, s.budget),
                      )),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, WidgetRef ref, {BudgetEntity? existing}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _BudgetFormSheet(existing: existing, ref: ref),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref, BudgetEntity budget) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir orçamento'),
        content: Text('Deseja excluir "${budget.name}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
    if (ok == true) await ref.read(budgetsProvider.notifier).delete(budget.id);
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onAdd});
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.account_balance_wallet_outlined, size: 72, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Nenhum orçamento criado', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Text('Defina limites de gastos por categoria', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Criar primeiro orçamento'),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.color});
  final String title;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 4, height: 16, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 8),
        Text(title, style: TextStyle(fontWeight: FontWeight.w700, color: color)),
      ],
    );
  }
}

class _BudgetCard extends StatelessWidget {
  const _BudgetCard({required this.summary, required this.onEdit, required this.onDelete});
  final BudgetSummary summary;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final b = summary.budget;
    final pct = summary.progressPercent;
    final isOver = summary.isOverBudget;
    final isNear = summary.isNearAlert;
    final barColor = isOver ? Colors.red : (isNear ? Colors.orange : Colors.green);

    String fmt(int cents) {
      final v = cents / 100;
      return 'R\$ ${v.toStringAsFixed(2).replaceAll('.', ',')}';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(b.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      Text(_periodLabel(b.period), style: TextStyle(fontSize: 12, color: cs.outline)),
                    ],
                  ),
                ),
                IconButton(icon: const Icon(Icons.edit_outlined, size: 18), onPressed: onEdit, padding: EdgeInsets.zero),
                IconButton(icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red), onPressed: onDelete, padding: EdgeInsets.zero),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${fmt(summary.spentCents)} gastos',
                  style: TextStyle(fontWeight: FontWeight.bold, color: barColor),
                ),
                Text(fmt(b.amountCents), style: TextStyle(color: cs.outline, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: pct,
                minHeight: 8,
                backgroundColor: barColor.withOpacity(0.15),
                valueColor: AlwaysStoppedAnimation(barColor),
              ),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${(pct * 100).toStringAsFixed(0)}% utilizado', style: TextStyle(fontSize: 12, color: cs.outline)),
                if (isOver)
                  Text('R\$ ${(summary.spentCents - b.amountCents) ~/ 100} acima do limite',
                      style: const TextStyle(fontSize: 12, color: Colors.red, fontWeight: FontWeight.w600))
                else
                  Text('R\$ ${summary.remainingCents ~/ 100} restantes',
                      style: TextStyle(fontSize: 12, color: cs.outline)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _periodLabel(BudgetPeriod p) => switch (p) {
    BudgetPeriod.weekly => 'Semanal',
    BudgetPeriod.monthly => 'Mensal',
    BudgetPeriod.yearly => 'Anual',
    BudgetPeriod.custom => 'Personalizado',
  };
}

class _BudgetFormSheet extends StatefulWidget {
  const _BudgetFormSheet({this.existing, required this.ref});
  final BudgetEntity? existing;
  final WidgetRef ref;

  @override
  State<_BudgetFormSheet> createState() => _BudgetFormSheetState();
}

class _BudgetFormSheetState extends State<_BudgetFormSheet> {
  final _nameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  BudgetPeriod _period = BudgetPeriod.monthly;
  double _alertAt = 80;
  String? _categoryId;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.existing != null) {
      final b = widget.existing!;
      _nameCtrl.text = b.name;
      _amountCtrl.text = (b.amountCents / 100).toStringAsFixed(2);
      _period = b.period;
      _alertAt = b.alertAt.toDouble();
      _categoryId = b.categoryId;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameCtrl.text.trim();
    final amount = double.tryParse(_amountCtrl.text.trim().replaceAll(',', '.'));
    if (name.isEmpty || amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preencha nome e valor do orçamento')));
      return;
    }
    setState(() => _loading = true);
    final notifier = widget.ref.read(budgetsProvider.notifier);

    if (widget.existing == null) {
      final result = await notifier.create(
        name: name,
        amountCents: (amount * 100).round(),
        period: _period,
        categoryId: _categoryId,
        alertAt: _alertAt.round(),
      );
      if (!mounted) return;
      result.fold(
        (f) { setState(() => _loading = false); ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(f.message))); },
        (_) => Navigator.pop(context),
      );
    } else {
      final b = widget.existing!;
      final now = DateTime.now();
      final updated = BudgetEntity(
        id: b.id,
        userId: b.userId,
        name: name,
        categoryId: _categoryId,
        amountCents: (amount * 100).round(),
        period: _period,
        startDate: b.startDate,
        endDate: b.endDate,
        alertAt: _alertAt.round(),
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: now,
      );
      final result = await notifier.save(updated);
      if (!mounted) return;
      result.fold(
        (f) { setState(() => _loading = false); ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(f.message))); },
        (_) => Navigator.pop(context),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = widget.ref.watch(categoriesProvider);
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.existing == null ? 'Novo Orçamento' : 'Editar Orçamento',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Nome do orçamento', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Limite (R\$)', prefixText: 'R\$ ', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<BudgetPeriod>(
              value: _period,
              decoration: const InputDecoration(labelText: 'Período', border: OutlineInputBorder()),
              items: BudgetPeriod.values.map((p) => DropdownMenuItem(
                value: p,
                child: Text(_periodLabel(p)),
              )).toList(),
              onChanged: (v) => setState(() => _period = v!),
            ),
            const SizedBox(height: 12),
            categoriesAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (_, __) => const SizedBox.shrink(),
              data: (cats) => DropdownButtonFormField<String?>(
                value: _categoryId,
                decoration: const InputDecoration(labelText: 'Categoria (opcional — deixe vazio para total)', border: OutlineInputBorder()),
                items: [
                  const DropdownMenuItem<String?>(value: null, child: Text('Todas as despesas')),
                  ...cats.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))),
                ],
                onChanged: (v) => setState(() => _categoryId = v),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Alerta em:', style: TextStyle(fontWeight: FontWeight.w500)),
                Text('${_alertAt.round()}%', style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            Slider(
              value: _alertAt,
              min: 50,
              max: 100,
              divisions: 10,
              label: '${_alertAt.round()}%',
              onChanged: (v) => setState(() => _alertAt = v),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(widget.existing == null ? 'Criar Orçamento' : 'Salvar'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _periodLabel(BudgetPeriod p) => switch (p) {
    BudgetPeriod.weekly => 'Semanal',
    BudgetPeriod.monthly => 'Mensal',
    BudgetPeriod.yearly => 'Anual',
    BudgetPeriod.custom => 'Personalizado',
  };
}
