import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/bill_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/extensions/double_extension.dart';
import '../../providers/bill_provider.dart';
import '../../providers/category_provider.dart';
import '../../providers/account_provider.dart';
import '../../providers/settings_provider.dart';

class BillsScreen extends ConsumerWidget {
  const BillsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final billsAsync = ref.watch(billsProvider);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Contas'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Todas'),
              Tab(text: 'A Pagar'),
              Tab(text: 'A Receber'),
            ],
          ),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _showForm(context, ref),
          child: const Icon(Icons.add),
        ),
        body: billsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Erro: $e')),
          data: (bills) => TabBarView(
            children: [
              _BillsList(bills: bills, ref: ref),
              _BillsList(
                  bills: bills
                      .where((b) => b.type == BillType.payable)
                      .toList(),
                  ref: ref),
              _BillsList(
                  bills: bills
                      .where((b) => b.type == BillType.receivable)
                      .toList(),
                  ref: ref),
            ],
          ),
        ),
      ),
    );
  }

  void _showForm(BuildContext context, WidgetRef ref,
      [BillEntity? bill]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _BillFormSheet(existing: bill, ref: ref),
    );
  }
}

// ─── Grouped bills list ───────────────────────────────────────────────────

class _BillsList extends StatelessWidget {
  const _BillsList({required this.bills, required this.ref});
  final List<BillEntity> bills;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    if (bills.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 12),
            Text('Nenhuma conta cadastrada',
                style: TextStyle(color: Colors.grey, fontSize: 16)),
            SizedBox(height: 8),
            Text('Toque em + para adicionar',
                style: TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
      );
    }

    // Group bills into sections
    final overdue = bills.where((b) => b.isOverdue).toList();
    final today = bills.where((b) => b.isPending && b.isDueToday).toList();
    final thisWeek = bills
        .where((b) =>
            b.isPending && !b.isOverdue && !b.isDueToday && b.daysUntilDue <= 7)
        .toList();
    final future = bills
        .where((b) => b.isPending && !b.isOverdue && b.daysUntilDue > 7)
        .toList();
    final settled =
        bills.where((b) => b.isSettled || b.status == BillStatus.cancelled).toList();

    return ListView(
      padding: const EdgeInsets.only(bottom: 88),
      children: [
        if (overdue.isNotEmpty) ...[
          _SectionHeader(
              label: 'Vencidas', color: AppColors.expense, count: overdue.length),
          ...overdue.map((b) => _BillTile(bill: b, ref: ref)),
        ],
        if (today.isNotEmpty) ...[
          _SectionHeader(
              label: 'Hoje', color: Colors.orange, count: today.length),
          ...today.map((b) => _BillTile(bill: b, ref: ref)),
        ],
        if (thisWeek.isNotEmpty) ...[
          _SectionHeader(
              label: 'Próximos 7 dias',
              color: Colors.amber.shade700,
              count: thisWeek.length),
          ...thisWeek.map((b) => _BillTile(bill: b, ref: ref)),
        ],
        if (future.isNotEmpty) ...[
          _SectionHeader(
              label: 'Futuras',
              color: AppColors.transfer,
              count: future.length),
          ...future.map((b) => _BillTile(bill: b, ref: ref)),
        ],
        if (settled.isNotEmpty) ...[
          _SectionHeader(
              label: 'Pagas / Recebidas',
              color: Colors.grey,
              count: settled.length),
          ...settled.map((b) => _BillTile(bill: b, ref: ref)),
        ],
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(
      {required this.label, required this.color, required this.count});
  final String label;
  final Color color;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 16,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(color: color),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '$count',
              style: TextStyle(
                  color: color,
                  fontSize: 11,
                  fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Bill tile ─────────────────────────────────────────────────────────────

class _BillTile extends StatelessWidget {
  const _BillTile({required this.bill, required this.ref});
  final BillEntity bill;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final isPayable = bill.type == BillType.payable;
    final typeColor = isPayable ? AppColors.expense : AppColors.income;
    final days = bill.daysUntilDue;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: typeColor.withValues(alpha: 0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isPayable ? Icons.arrow_upward : Icons.arrow_downward,
            color: typeColor,
            size: 20,
          ),
        ),
        title: Text(
          bill.title,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            decoration:
                bill.isSettled ? TextDecoration.lineThrough : null,
            color: bill.isSettled ? Colors.grey : null,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _formatDueDate(bill),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: bill.isOverdue ? AppColors.expense : null,
                  ),
            ),
            const SizedBox(height: 2),
            _StatusChip(bill: bill),
          ],
        ),
        isThreeLine: true,
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              (bill.amountCents / 100.0).toCurrency(),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isPayable ? AppColors.expense : AppColors.income,
                fontSize: 14,
              ),
            ),
            if (bill.isPending && !bill.isSettled)
              Text(
                _daysText(days),
                style: TextStyle(
                  fontSize: 11,
                  color: bill.isOverdue
                      ? AppColors.expense
                      : days <= 3
                          ? Colors.orange
                          : Colors.grey,
                ),
              ),
          ],
        ),
        onTap: () => _showActions(context),
      ),
    );
  }

  String _formatDueDate(BillEntity b) {
    final d = b.dueDate;
    return 'Vence em ${d.day.toString().padLeft(2, '0')}/'
        '${d.month.toString().padLeft(2, '0')}/${d.year}';
  }

  String _daysText(int days) {
    if (days < 0) return '${days.abs()} dia${days.abs() != 1 ? 's' : ''} atraso';
    if (days == 0) return 'Hoje';
    if (days == 1) return 'Amanhã';
    return 'Em $days dias';
  }

  void _showActions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (bill.isPending) ...[
              ListTile(
                leading: Icon(
                  Icons.check_circle_outline,
                  color: bill.type == BillType.payable
                      ? AppColors.expense
                      : AppColors.income,
                ),
                title: Text(
                  bill.type == BillType.payable
                      ? 'Marcar como paga'
                      : 'Marcar como recebida',
                ),
                onTap: () async {
                  Navigator.pop(ctx);
                  await ref
                      .read(billsProvider.notifier)
                      .markAsPaid(bill);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(bill.type == BillType.payable
                            ? 'Pagamento registrado!'
                            : 'Recebimento registrado!'),
                        backgroundColor: AppColors.income,
                      ),
                    );
                  }
                },
              ),
            ],
            ListTile(
              leading: const Icon(Icons.edit),
              title: const Text('Editar'),
              onTap: () {
                Navigator.pop(ctx);
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  useSafeArea: true,
                  builder: (_) => _BillFormSheet(existing: bill, ref: ref),
                );
              },
            ),
            ListTile(
              leading:
                  const Icon(Icons.delete_outline, color: Colors.red),
              title: const Text('Excluir',
                  style: TextStyle(color: Colors.red)),
              onTap: () async {
                Navigator.pop(ctx);
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (d) => AlertDialog(
                    title: const Text('Excluir conta'),
                    content:
                        Text('Excluir "${bill.title}"?'),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(d, false),
                          child: const Text('Cancelar')),
                      TextButton(
                          onPressed: () => Navigator.pop(d, true),
                          child: const Text('Excluir')),
                    ],
                  ),
                );
                if (confirmed == true) {
                  await ref
                      .read(billsProvider.notifier)
                      .delete(bill);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.bill});
  final BillEntity bill;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (bill.effectiveStatus) {
      BillStatus.overdue => ('Vencida', AppColors.expense),
      BillStatus.paid => ('Paga', AppColors.income),
      BillStatus.received => ('Recebida', AppColors.income),
      BillStatus.cancelled => ('Cancelada', Colors.grey),
      BillStatus.pending => bill.isDueToday
          ? ('Vence hoje', Colors.orange)
          : ('Pendente', Colors.grey),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
            color: color, fontSize: 10, fontWeight: FontWeight.w600),
      ),
    );
  }
}

// ─── Bill form sheet ──────────────────────────────────────────────────────

class _BillFormSheet extends StatefulWidget {
  const _BillFormSheet({this.existing, required this.ref});
  final BillEntity? existing;
  final WidgetRef ref;

  @override
  State<_BillFormSheet> createState() => _BillFormSheetState();
}

class _BillFormSheetState extends State<_BillFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleCtrl;
  late final TextEditingController _amountCtrl;
  late final TextEditingController _descCtrl;

  BillType _type = BillType.payable;
  DateTime _dueDate = DateTime.now().add(const Duration(days: 7));
  BillRecurrence _recurrence = BillRecurrence.none;
  String? _categoryId;
  String? _accountId;
  late Set<int> _reminderDays;
  bool _saving = false;

  static const _availableReminderDays = [3, 2, 1, 0];

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _titleCtrl = TextEditingController(text: e?.title ?? '');
    _amountCtrl = TextEditingController(
      text: e != null
          ? (e.amountCents / 100.0).toStringAsFixed(2)
          : '',
    );
    _descCtrl = TextEditingController(text: e?.description ?? '');

    if (e != null) {
      _type = e.type;
      _dueDate = e.dueDate;
      _recurrence = e.recurrence;
      _categoryId = e.categoryId;
      _accountId = e.accountId;
      _reminderDays = Set<int>.from(e.reminderDays);
    } else {
      // Load defaults from settings
      final settings = widget.ref.read(settingsProvider).valueOrNull;
      _reminderDays = Set<int>.from(
          settings?.billNotificationDays ?? [3, 2, 1, 0]);
    }
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _amountCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final amountText = _amountCtrl.text.replaceAll(',', '.');
    final amountCents = ((double.tryParse(amountText) ?? 0) * 100).round();
    final reminderList = _reminderDays.toList()..sort((a, b) => b.compareTo(a));

    if (widget.existing == null) {
      await widget.ref.read(billsProvider.notifier).create(
            title: _titleCtrl.text,
            type: _type,
            amountCents: amountCents,
            dueDate: _dueDate,
            description:
                _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
            categoryId: _categoryId,
            accountId: _accountId,
            recurrence: _recurrence,
            reminderDays: reminderList,
          );
    } else {
      await widget.ref.read(billsProvider.notifier).edit(
            widget.existing!.copyWith(
              title: _titleCtrl.text,
              type: _type,
              amountCents: amountCents,
              dueDate: _dueDate,
              description:
                  _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
              categoryId: _categoryId,
              accountId: _accountId,
              recurrence: _recurrence,
              reminderDays: reminderList,
            ),
          );
    }
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = widget.ref.watch(categoriesProvider);
    final accountsAsync = widget.ref.watch(accountsProvider);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.viewInsetsOf(context).bottom,
        left: 16,
        right: 16,
        top: 24,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.existing == null ? 'Nova Conta' : 'Editar Conta',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),

              // Type selector
              SegmentedButton<BillType>(
                segments: const [
                  ButtonSegment(
                    value: BillType.payable,
                    label: Text('A Pagar'),
                    icon: Icon(Icons.arrow_upward, size: 16),
                  ),
                  ButtonSegment(
                    value: BillType.receivable,
                    label: Text('A Receber'),
                    icon: Icon(Icons.arrow_downward, size: 16),
                  ),
                ],
                selected: {_type},
                onSelectionChanged: (s) =>
                    setState(() => _type = s.first),
              ),
              const SizedBox(height: 16),

              // Title
              TextFormField(
                controller: _titleCtrl,
                decoration: const InputDecoration(
                  labelText: 'Descrição',
                  border: OutlineInputBorder(),
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Digite uma descrição'
                    : null,
              ),
              const SizedBox(height: 12),

              // Amount
              TextFormField(
                controller: _amountCtrl,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Valor',
                  border: OutlineInputBorder(),
                  prefixText: 'R\$ ',
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Digite o valor';
                  final n = double.tryParse(v.replaceAll(',', '.'));
                  if (n == null || n <= 0) return 'Valor inválido';
                  return null;
                },
              ),
              const SizedBox(height: 12),

              // Due date
              InkWell(
                onTap: () async {
                  final d = await showDatePicker(
                    context: context,
                    initialDate: _dueDate,
                    firstDate: DateTime(2000),
                    lastDate: DateTime(2100),
                  );
                  if (d != null) setState(() => _dueDate = d);
                },
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Data de vencimento',
                    border: OutlineInputBorder(),
                    suffixIcon: Icon(Icons.calendar_today),
                  ),
                  child: Text(
                    '${_dueDate.day.toString().padLeft(2, '0')}/'
                    '${_dueDate.month.toString().padLeft(2, '0')}/'
                    '${_dueDate.year}',
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Recurrence
              DropdownButtonFormField<BillRecurrence>(
                value: _recurrence,
                decoration: const InputDecoration(
                  labelText: 'Recorrência',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(
                      value: BillRecurrence.none, child: Text('Nenhuma')),
                  DropdownMenuItem(
                      value: BillRecurrence.weekly, child: Text('Semanal')),
                  DropdownMenuItem(
                      value: BillRecurrence.monthly, child: Text('Mensal')),
                  DropdownMenuItem(
                      value: BillRecurrence.yearly, child: Text('Anual')),
                ],
                onChanged: (v) => setState(() => _recurrence = v!),
              ),
              const SizedBox(height: 12),

              // Category (optional)
              categoriesAsync.when(
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
                data: (cats) => DropdownButtonFormField<String?>(
                  value: _categoryId,
                  decoration: const InputDecoration(
                    labelText: 'Categoria (opcional)',
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    const DropdownMenuItem(
                        value: null, child: Text('Sem categoria')),
                    ...cats.map((c) => DropdownMenuItem(
                          value: c.id,
                          child: Text(c.name),
                        )),
                  ],
                  onChanged: (v) => setState(() => _categoryId = v),
                ),
              ),
              const SizedBox(height: 12),

              // Account (optional)
              accountsAsync.when(
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
                data: (accs) => DropdownButtonFormField<String?>(
                  value: _accountId,
                  decoration: const InputDecoration(
                    labelText: 'Conta (opcional)',
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    const DropdownMenuItem(
                        value: null, child: Text('Sem conta vinculada')),
                    ...accs.map((a) => DropdownMenuItem(
                          value: a.id,
                          child: Text(a.name),
                        )),
                  ],
                  onChanged: (v) => setState(() => _accountId = v),
                ),
              ),
              const SizedBox(height: 20),

              // ── Notification timing ─────────────────────────────────────
              Text(
                'Lembrar-me antes do vencimento',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 4),
              Text(
                'As notificações são enviadas às 9h do dia selecionado.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey,
                    ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _availableReminderDays.map((day) {
                  final isSelected = _reminderDays.contains(day);
                  final label = day == 0
                      ? 'No dia'
                      : day == 1
                          ? '1 dia antes'
                          : '$day dias antes';
                  return FilterChip(
                    label: Text(label),
                    selected: isSelected,
                    onSelected: (v) => setState(() {
                      if (v) {
                        _reminderDays.add(day);
                      } else {
                        _reminderDays.remove(day);
                      }
                    }),
                  );
                }).toList(),
              ),
              const SizedBox(height: 8),
              Text(
                _reminderDays.isEmpty
                    ? 'Nenhuma notificação será enviada.'
                    : 'Você receberá ${_reminderDays.length} '
                        'notificação${_reminderDays.length > 1 ? 'ões' : ''} para esta conta.',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: _reminderDays.isEmpty
                          ? Colors.grey
                          : Theme.of(context).colorScheme.primary,
                    ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(widget.existing == null ? 'Salvar' : 'Atualizar'),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
