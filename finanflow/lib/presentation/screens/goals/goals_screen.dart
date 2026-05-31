import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/entities/goal_entity.dart';
import '../../providers/goal_provider.dart';

class GoalsScreen extends ConsumerWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(goalsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Metas Financeiras')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Nova Meta'),
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (goals) {
          if (goals.isEmpty) {
            return _EmptyState(onAdd: () => _showForm(context, ref));
          }
          final active = goals.where((g) => g.status == GoalStatus.active || g.status == GoalStatus.paused).toList();
          final completed = goals.where((g) => g.status == GoalStatus.completed).toList();
          return RefreshIndicator(
            onRefresh: () => ref.read(goalsProvider.notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              children: [
                if (active.isNotEmpty) ...[
                  _SectionHeader(title: 'Ativas (${active.length})'),
                  const SizedBox(height: 8),
                  ...active.map((g) => _GoalCard(
                        goal: g,
                        onContribute: () => _showContribute(context, ref, g),
                        onEdit: () => _showForm(context, ref, existing: g),
                        onDelete: () => _confirmDelete(context, ref, g),
                      )),
                ],
                if (completed.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _SectionHeader(title: 'Concluídas (${completed.length})'),
                  const SizedBox(height: 8),
                  ...completed.map((g) => _GoalCard(goal: g)),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, WidgetRef ref, {GoalEntity? existing}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _GoalFormSheet(existing: existing, ref: ref),
    );
  }

  void _showContribute(BuildContext context, WidgetRef ref, GoalEntity goal) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _ContributeSheet(goal: goal, ref: ref),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref, GoalEntity goal) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir meta'),
        content: Text('Deseja excluir "${goal.name}"?'),
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
    if (ok == true) await ref.read(goalsProvider.notifier).delete(goal.id);
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
          const Icon(Icons.flag_outlined, size: 72, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Nenhuma meta criada', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Text('Crie uma meta para acompanhar seu progresso', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Criar minha primeira meta'),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleSmall?.copyWith(
            color: Theme.of(context).colorScheme.primary,
            fontWeight: FontWeight.w700,
          ),
    );
  }
}

class _GoalCard extends StatelessWidget {
  const _GoalCard({
    required this.goal,
    this.onContribute,
    this.onEdit,
    this.onDelete,
  });
  final GoalEntity goal;
  final VoidCallback? onContribute;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final pct = goal.progressPercent;
    final isComplete = goal.isComplete;
    final color = goal.color;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: color.withOpacity(0.15),
                  child: Icon(_goalIcon(goal.type), color: color, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(goal.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      Text(_goalTypeLabel(goal.type), style: TextStyle(fontSize: 12, color: cs.outline)),
                    ],
                  ),
                ),
                if (isComplete)
                  const Icon(Icons.check_circle, color: Colors.green)
                else if (onEdit != null) ...[
                  IconButton(icon: const Icon(Icons.edit_outlined, size: 18), onPressed: onEdit, padding: EdgeInsets.zero),
                  IconButton(icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red), onPressed: onDelete, padding: EdgeInsets.zero),
                ],
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _fmt(goal.currentAmountCents),
                  style: TextStyle(fontWeight: FontWeight.bold, color: color),
                ),
                Text(
                  _fmt(goal.targetAmountCents),
                  style: TextStyle(color: cs.outline, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: pct,
                minHeight: 8,
                backgroundColor: color.withOpacity(0.15),
                valueColor: AlwaysStoppedAnimation(isComplete ? Colors.green : color),
              ),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${(pct * 100).toStringAsFixed(0)}%', style: TextStyle(fontSize: 12, color: cs.outline)),
                if (goal.targetDate != null)
                  Text(
                    'Até ${_fmtDate(goal.targetDate!)}',
                    style: TextStyle(fontSize: 12, color: cs.outline),
                  ),
              ],
            ),
            if (onContribute != null && !isComplete) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onContribute,
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Contribuir'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _fmt(int cents) {
    final v = cents / 100;
    return 'R\$ ${v.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  String _fmtDate(DateTime d) => '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}

class _ContributeSheet extends StatefulWidget {
  const _ContributeSheet({required this.goal, required this.ref});
  final GoalEntity goal;
  final WidgetRef ref;

  @override
  State<_ContributeSheet> createState() => _ContributeSheetState();
}

class _ContributeSheetState extends State<_ContributeSheet> {
  final _ctrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final text = _ctrl.text.trim().replaceAll(',', '.');
    final value = double.tryParse(text);
    if (value == null || value <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Valor inválido')));
      return;
    }
    setState(() => _loading = true);
    final result = await widget.ref.read(goalsProvider.notifier).contribute(widget.goal.id, (value * 100).round());
    if (!mounted) return;
    setState(() => _loading = false);
    result.fold(
      (f) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(f.message))),
      (_) => Navigator.pop(context),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Contribuir para "${widget.goal.name}"', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('Faltam R\$ ${(widget.goal.remainingAmountCents / 100).toStringAsFixed(2)} para a meta'),
          const SizedBox(height: 16),
          TextField(
            controller: _ctrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            autofocus: true,
            decoration: const InputDecoration(
              labelText: 'Valor (R\$)',
              prefixText: 'R\$ ',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Confirmar'),
            ),
          ),
        ],
      ),
    );
  }
}

class _GoalFormSheet extends StatefulWidget {
  const _GoalFormSheet({this.existing, required this.ref});
  final GoalEntity? existing;
  final WidgetRef ref;

  @override
  State<_GoalFormSheet> createState() => _GoalFormSheetState();
}

class _GoalFormSheetState extends State<_GoalFormSheet> {
  final _nameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _monthlyCtrl = TextEditingController();
  GoalType _type = GoalType.savings;
  Color _color = AppColors.seed;
  DateTime? _targetDate;
  bool _loading = false;

  static const _colors = [
    Colors.blue, Colors.green, Colors.orange, Colors.purple,
    Colors.red, Colors.teal, Colors.pink, Colors.indigo,
  ];

  @override
  void initState() {
    super.initState();
    if (widget.existing != null) {
      final g = widget.existing!;
      _nameCtrl.text = g.name;
      _amountCtrl.text = (g.targetAmountCents / 100).toStringAsFixed(2);
      if (g.monthlyContributionCents != null) {
        _monthlyCtrl.text = (g.monthlyContributionCents! / 100).toStringAsFixed(2);
      }
      _type = g.type;
      _color = g.color;
      _targetDate = g.targetDate;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _amountCtrl.dispose();
    _monthlyCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameCtrl.text.trim();
    final amount = double.tryParse(_amountCtrl.text.trim().replaceAll(',', '.'));
    if (name.isEmpty || amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preencha nome e valor da meta')));
      return;
    }
    final monthly = double.tryParse(_monthlyCtrl.text.trim().replaceAll(',', '.'));
    setState(() => _loading = true);
    final notifier = widget.ref.read(goalsProvider.notifier);

    if (widget.existing == null) {
      final result = await notifier.create(
        name: name,
        type: _type,
        targetAmountCents: (amount * 100).round(),
        color: _color,
        targetDate: _targetDate,
        monthlyContributionCents: monthly != null ? (monthly * 100).round() : null,
      );
      if (!mounted) return;
      result.fold(
        (f) { setState(() => _loading = false); ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(f.message))); },
        (_) => Navigator.pop(context),
      );
    } else {
      final updated = widget.existing!.copyWith(
        name: name,
        type: _type,
        targetAmountCents: (amount * 100).round(),
        color: _color,
        targetDate: _targetDate,
        monthlyContributionCents: monthly != null ? (monthly * 100).round() : null,
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
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.existing == null ? 'Nova Meta' : 'Editar Meta',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Nome da meta', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<GoalType>(
              value: _type,
              decoration: const InputDecoration(labelText: 'Tipo', border: OutlineInputBorder()),
              items: GoalType.values.map((t) => DropdownMenuItem(value: t, child: Text(_goalTypeLabel(t)))).toList(),
              onChanged: (v) => setState(() => _type = v!),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Valor da meta (R\$)', prefixText: 'R\$ ', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _monthlyCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Contribuição mensal (opcional)',
                prefixText: 'R\$ ',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(_targetDate == null ? 'Data alvo (opcional)' : 'Data alvo: ${_targetDate!.day}/${_targetDate!.month}/${_targetDate!.year}'),
              trailing: const Icon(Icons.calendar_today),
              onTap: () async {
                final d = await showDatePicker(
                  context: context,
                  initialDate: _targetDate ?? DateTime.now().add(const Duration(days: 365)),
                  firstDate: DateTime.now(),
                  lastDate: DateTime(2100),
                );
                if (d != null) setState(() => _targetDate = d);
              },
            ),
            const SizedBox(height: 12),
            const Text('Cor', style: TextStyle(fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _colors.map((c) => GestureDetector(
                onTap: () => setState(() => _color = c),
                child: CircleAvatar(
                  backgroundColor: c,
                  radius: 18,
                  child: _color == c ? const Icon(Icons.check, color: Colors.white, size: 16) : null,
                ),
              )).toList(),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(widget.existing == null ? 'Criar Meta' : 'Salvar'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

IconData _goalIcon(GoalType type) => switch (type) {
  GoalType.savings => Icons.savings_outlined,
  GoalType.debtPayoff => Icons.credit_card_off_outlined,
  GoalType.emergencyFund => Icons.shield_outlined,
  GoalType.investment => Icons.trending_up,
  GoalType.purchase => Icons.shopping_bag_outlined,
  GoalType.other => Icons.flag_outlined,
};

String _goalTypeLabel(GoalType type) => switch (type) {
  GoalType.savings => 'Poupança',
  GoalType.debtPayoff => 'Quitação de dívida',
  GoalType.emergencyFund => 'Reserva de emergência',
  GoalType.investment => 'Investimento',
  GoalType.purchase => 'Compra',
  GoalType.other => 'Outro',
};
