import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/account_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/extensions/double_extension.dart';
import '../../providers/account_provider.dart';

class AccountsScreen extends ConsumerWidget {
  const AccountsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accountsAsync = ref.watch(accountsProvider);
    final totalBalance = ref.watch(totalBalanceProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Contas')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAccountForm(context, ref),
        child: const Icon(Icons.add),
      ),
      body: accountsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (accounts) => Column(
          children: [
            _TotalBalanceHeader(totalCents: totalBalance),
            Expanded(
              child: accounts.isEmpty
                  ? const _EmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: accounts.length,
                      itemBuilder: (context, i) => _AccountCard(
                        account: accounts[i],
                        onEdit: () => _showAccountForm(context, ref, accounts[i]),
                        onDelete: () => _confirmDelete(context, ref, accounts[i]),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAccountForm(BuildContext context, WidgetRef ref, [AccountEntity? account]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _AccountFormSheet(existing: account, ref: ref),
    );
  }

  Future<void> _confirmDelete(
      BuildContext context, WidgetRef ref, AccountEntity account) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir conta'),
        content: Text('Deseja excluir "${account.name}"? '
            'As transações associadas serão mantidas.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(accountsProvider.notifier).delete(account.id);
    }
  }
}

// ─── Total balance header ─────────────────────────────────────────────────

class _TotalBalanceHeader extends StatelessWidget {
  const _TotalBalanceHeader({required this.totalCents});
  final int totalCents;

  @override
  Widget build(BuildContext context) {
    final balance = totalCents / 100.0;
    final isPositive = totalCents >= 0;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.premiumGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Saldo Total',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white70,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            balance.toCurrency(),
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                isPositive ? Icons.trending_up : Icons.trending_down,
                color: Colors.white70,
                size: 16,
              ),
              const SizedBox(width: 4),
              Text(
                isPositive ? 'Saldo positivo' : 'Saldo negativo',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Account card ─────────────────────────────────────────────────────────

class _AccountCard extends StatelessWidget {
  const _AccountCard({
    required this.account,
    required this.onEdit,
    required this.onDelete,
  });

  final AccountEntity account;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final balance = account.currentBalance;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: account.color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            _accountIcon(account.type),
            color: account.color,
            size: 24,
          ),
        ),
        title: Text(account.name,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _accountTypeLabel(account.type),
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (account.bankName != null)
              Text(
                account.bankName!,
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: Colors.grey),
              ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              balance.toCurrency(),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: balance >= 0 ? AppColors.income : AppColors.expense,
                fontSize: 15,
              ),
            ),
            if (!account.includeInTotal)
              Text(
                'Excluída do total',
                style: Theme.of(context)
                    .textTheme
                    .labelSmall
                    ?.copyWith(color: Colors.grey),
              ),
          ],
        ),
        onLongPress: () {
          showModalBottomSheet(
            context: context,
            builder: (ctx) => SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(
                    leading: const Icon(Icons.edit),
                    title: const Text('Editar'),
                    onTap: () {
                      Navigator.pop(ctx);
                      onEdit();
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.delete_outline, color: Colors.red),
                    title: const Text('Excluir',
                        style: TextStyle(color: Colors.red)),
                    onTap: () {
                      Navigator.pop(ctx);
                      onDelete();
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.account_balance_wallet_outlined, size: 64, color: Colors.grey),
          SizedBox(height: 12),
          Text('Nenhuma conta cadastrada',
              style: TextStyle(color: Colors.grey, fontSize: 16)),
          SizedBox(height: 8),
          Text('Toque em + para adicionar uma conta',
              style: TextStyle(color: Colors.grey, fontSize: 13)),
        ],
      ),
    );
  }
}

// ─── Form sheet ──────────────────────────────────────────────────────────

class _AccountFormSheet extends StatefulWidget {
  const _AccountFormSheet({this.existing, required this.ref});
  final AccountEntity? existing;
  final WidgetRef ref;

  @override
  State<_AccountFormSheet> createState() => _AccountFormSheetState();
}

class _AccountFormSheetState extends State<_AccountFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _balanceCtrl;
  late final TextEditingController _bankCtrl;
  AccountType _type = AccountType.checking;
  Color _color = AppColors.chartPalette.first;
  String _iconName = 'account_balance';
  bool _includeInTotal = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _nameCtrl = TextEditingController(text: e?.name ?? '');
    _bankCtrl = TextEditingController(text: e?.bankName ?? '');
    _balanceCtrl = TextEditingController(
      text: e != null ? (e.initialBalanceCents / 100.0).toStringAsFixed(2) : '',
    );
    if (e != null) {
      _type = e.type;
      _color = e.color;
      _iconName = e.iconName;
      _includeInTotal = e.includeInTotal;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _balanceCtrl.dispose();
    _bankCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final balanceText = _balanceCtrl.text.replaceAll(',', '.');
    final balanceCents = ((double.tryParse(balanceText) ?? 0) * 100).round();
    final notifier = widget.ref.read(accountsProvider.notifier);

    if (widget.existing == null) {
      await notifier.create(
        name: _nameCtrl.text,
        type: _type,
        initialBalanceCents: balanceCents,
        color: _color,
        iconName: _iconName,
        bankName: _bankCtrl.text.trim().isEmpty ? null : _bankCtrl.text.trim(),
        includeInTotal: _includeInTotal,
      );
    } else {
      await notifier.save(
        widget.existing!.copyWith(
          name: _nameCtrl.text,
          type: _type,
          color: _color,
          iconName: _iconName,
          bankName: _bankCtrl.text.trim().isEmpty ? null : _bankCtrl.text.trim(),
          includeInTotal: _includeInTotal,
        ),
      );
    }

    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
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
              const SizedBox(height: 20),
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Nome da conta',
                  border: OutlineInputBorder(),
                ),
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Digite um nome' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<AccountType>(
                value: _type,
                decoration: const InputDecoration(
                  labelText: 'Tipo',
                  border: OutlineInputBorder(),
                ),
                items: AccountType.values.map((t) {
                  return DropdownMenuItem(
                    value: t,
                    child: Text(_accountTypeLabel(t)),
                  );
                }).toList(),
                onChanged: (v) => setState(() => _type = v!),
              ),
              const SizedBox(height: 12),
              if (widget.existing == null)
                TextFormField(
                  controller: _balanceCtrl,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'Saldo inicial',
                    border: OutlineInputBorder(),
                    prefixText: 'R\$ ',
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return null;
                    final parsed = double.tryParse(v.replaceAll(',', '.'));
                    if (parsed == null) return 'Valor inválido';
                    return null;
                  },
                ),
              if (widget.existing == null) const SizedBox(height: 12),
              TextFormField(
                controller: _bankCtrl,
                decoration: const InputDecoration(
                  labelText: 'Banco (opcional)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              Text('Cor', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              _ColorPicker(
                selected: _color,
                onSelected: (c) => setState(() => _color = c),
              ),
              const SizedBox(height: 16),
              Text('Ícone', style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              _AccountIconPicker(
                selected: _iconName,
                onSelected: (v) => setState(() => _iconName = v),
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Incluir no saldo total'),
                value: _includeInTotal,
                onChanged: (v) => setState(() => _includeInTotal = v),
              ),
              const SizedBox(height: 16),
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
                      : Text(widget.existing == null ? 'Criar' : 'Salvar'),
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

// ─── Color picker ────────────────────────────────────────────────────────

class _ColorPicker extends StatelessWidget {
  const _ColorPicker({required this.selected, required this.onSelected});
  final Color selected;
  final ValueChanged<Color> onSelected;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: AppColors.chartPalette.map((color) {
        final isSelected = color.toARGB32() == selected.toARGB32();
        return GestureDetector(
          onTap: () => onSelected(color),
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: isSelected
                  ? Border.all(
                      color: Theme.of(context).colorScheme.onSurface,
                      width: 3,
                    )
                  : null,
            ),
            child: isSelected
                ? const Icon(Icons.check, color: Colors.white, size: 18)
                : null,
          ),
        );
      }).toList(),
    );
  }
}

// ─── Account Icon picker ──────────────────────────────────────────────────

const _accountIcons = <String, IconData>{
  'account_balance': Icons.account_balance,
  'account_balance_wallet': Icons.account_balance_wallet,
  'savings': Icons.savings,
  'credit_card': Icons.credit_card,
  'attach_money': Icons.attach_money,
  'business': Icons.business,
  'trending_up': Icons.trending_up,
  'payments': Icons.payments,
};

class _AccountIconPicker extends StatelessWidget {
  const _AccountIconPicker({required this.selected, required this.onSelected});
  final String selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _accountIcons.entries.map((e) {
        final isSelected = e.key == selected;
        return GestureDetector(
          onTap: () => onSelected(e.key),
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isSelected
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              e.value,
              color: isSelected
                  ? Theme.of(context).colorScheme.onPrimary
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              size: 22,
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────

IconData _accountIcon(AccountType type) => switch (type) {
      AccountType.checking => Icons.account_balance,
      AccountType.savings => Icons.savings,
      AccountType.investment => Icons.trending_up,
      AccountType.cash => Icons.payments,
      AccountType.other => Icons.account_balance_wallet,
    };

String _accountTypeLabel(AccountType type) => switch (type) {
      AccountType.checking => 'Conta Corrente',
      AccountType.savings => 'Poupança',
      AccountType.investment => 'Investimento',
      AccountType.cash => 'Dinheiro',
      AccountType.other => 'Outro',
    };
