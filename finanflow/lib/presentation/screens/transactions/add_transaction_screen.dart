import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../../domain/entities/transaction_entity.dart';
import '../../../domain/entities/category_entity.dart';
import '../../../domain/entities/account_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/category_provider.dart';
import '../../providers/account_provider.dart';

class AddTransactionScreen extends ConsumerStatefulWidget {
  const AddTransactionScreen({super.key, this.initialType});
  final TransactionType? initialType;

  @override
  ConsumerState<AddTransactionScreen> createState() =>
      _AddTransactionScreenState();
}

class _AddTransactionScreenState
    extends ConsumerState<AddTransactionScreen> {
  late TransactionType _type;
  final _amountCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  DateTime _date = DateTime.now();
  CategoryEntity? _selectedCategory;
  AccountEntity? _selectedAccount;
  AccountEntity? _toAccount; // for transfers
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _type = widget.initialType ?? TransactionType.expense;
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final amountText =
        _amountCtrl.text.replaceAll(',', '.').replaceAll(r'R$', '').trim();
    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Digite um valor válido')));
      return;
    }

    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Selecione uma categoria')));
      return;
    }

    if (_selectedAccount == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Selecione uma conta')));
      return;
    }

    if (_type == TransactionType.transfer && _toAccount == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Selecione a conta de destino')));
      return;
    }

    setState(() => _saving = true);

    final userId = ref.read(authProvider).valueOrNull?.userId ?? 'default';
    final now = DateTime.now();
    final amountCents = (amount * 100).round();

    if (_type == TransactionType.transfer) {
      final result = await ref.read(accountsProvider.notifier).transfer(
            fromAccountId: _selectedAccount!.id,
            toAccountId: _toAccount!.id,
            amountCents: amountCents,
            categoryId: _selectedCategory!.id,
            date: _date,
            description: _descCtrl.text.isEmpty ? null : _descCtrl.text,
          );
      if (mounted) {
        setState(() => _saving = false);
        if (result.isRight) context.pop();
      }
      return;
    }

    final t = TransactionEntity(
      id: const Uuid().v4(),
      userId: userId,
      categoryId: _selectedCategory!.id,
      accountId: _selectedAccount!.id,
      type: _type,
      amountCents: amountCents,
      description: _descCtrl.text.isEmpty ? null : _descCtrl.text,
      date: _date,
      isRecurring: false,
      status: TransactionStatus.confirmed,
      createdAt: now,
      updatedAt: now,
    );

    final ok = await ref.read(transactionProvider.notifier).addTransaction(t);
    if (mounted) {
      setState(() => _saving = false);
      if (ok) context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoryType = _type == TransactionType.income
        ? CategoryType.income
        : _type == TransactionType.expense
            ? CategoryType.expense
            : null;

    final categoriesAsync = categoryType != null
        ? ref.watch(categoriesByTypeProvider(categoryType))
        : ref.watch(categoriesByTypeProvider(CategoryType.expense));

    final accountsAsync = ref.watch(accountsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Nova Transação')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SegmentedButton<TransactionType>(
            segments: const [
              ButtonSegment(
                value: TransactionType.expense,
                label: Text('Despesa'),
                icon: Icon(Icons.arrow_downward),
              ),
              ButtonSegment(
                value: TransactionType.income,
                label: Text('Receita'),
                icon: Icon(Icons.arrow_upward),
              ),
              ButtonSegment(
                value: TransactionType.transfer,
                label: Text('Transfer.'),
                icon: Icon(Icons.swap_horiz),
              ),
            ],
            selected: {_type},
            onSelectionChanged: (s) => setState(() {
              _type = s.first;
              _selectedCategory = null;
            }),
          ),
          const SizedBox(height: 20),

          // Amount
          TextField(
            controller: _amountCtrl,
            keyboardType:
                const TextInputType.numberWithOptions(decimal: true),
            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              labelText: 'Valor',
              prefixText: 'R\$ ',
              border: const OutlineInputBorder(),
              prefixStyle: TextStyle(
                fontSize: 20,
                color: _type == TransactionType.income
                    ? AppColors.income
                    : _type == TransactionType.expense
                        ? AppColors.expense
                        : AppColors.transfer,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Description
          TextField(
            controller: _descCtrl,
            decoration: const InputDecoration(
              labelText: 'Descrição (opcional)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),

          // Date picker
          InkWell(
            onTap: () async {
              final d = await showDatePicker(
                context: context,
                initialDate: _date,
                firstDate: DateTime(2000),
                lastDate: DateTime(2100),
              );
              if (d != null) setState(() => _date = d);
            },
            child: InputDecorator(
              decoration: const InputDecoration(
                labelText: 'Data',
                border: OutlineInputBorder(),
                suffixIcon: Icon(Icons.calendar_today),
              ),
              child: Text(
                '${_date.day.toString().padLeft(2, '0')}/'
                '${_date.month.toString().padLeft(2, '0')}/'
                '${_date.year}',
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Category selector
          categoriesAsync.when(
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('Erro ao carregar categorias: $e'),
            data: (categories) => _DropdownField<CategoryEntity>(
              label: 'Categoria',
              value: _selectedCategory,
              items: categories,
              itemLabel: (c) => c.name,
              itemIcon: (c) => Icon(Icons.circle, color: c.color, size: 14),
              onChanged: (c) => setState(() => _selectedCategory = c),
            ),
          ),
          const SizedBox(height: 16),

          // Account selector
          accountsAsync.when(
            loading: () => const LinearProgressIndicator(),
            error: (e, _) => Text('Erro ao carregar contas: $e'),
            data: (accounts) => _DropdownField<AccountEntity>(
              label: _type == TransactionType.transfer
                  ? 'Conta de origem'
                  : 'Conta',
              value: _selectedAccount,
              items: accounts,
              itemLabel: (a) => a.name,
              itemIcon: (a) => Icon(_accountIcon(a.type),
                  color: a.color, size: 16),
              onChanged: (a) => setState(() => _selectedAccount = a),
            ),
          ),

          // Transfer: destination account
          if (_type == TransactionType.transfer) ...[
            const SizedBox(height: 16),
            accountsAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (e, _) => const SizedBox.shrink(),
              data: (accounts) => _DropdownField<AccountEntity>(
                label: 'Conta de destino',
                value: _toAccount,
                items: accounts
                    .where((a) => a.id != _selectedAccount?.id)
                    .toList(),
                itemLabel: (a) => a.name,
                itemIcon: (a) => Icon(_accountIcon(a.type),
                    color: a.color, size: 16),
                onChanged: (a) => setState(() => _toAccount = a),
              ),
            ),
          ],

          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Salvar', style: TextStyle(fontSize: 16)),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

// ─── Generic dropdown field ───────────────────────────────────────────────

class _DropdownField<T> extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.itemLabel,
    required this.itemIcon,
    required this.onChanged,
  });

  final String label;
  final T? value;
  final List<T> items;
  final String Function(T) itemLabel;
  final Widget Function(T) itemIcon;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      value: value,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      items: items.map((item) {
        return DropdownMenuItem<T>(
          value: item,
          child: Row(
            children: [
              itemIcon(item),
              const SizedBox(width: 8),
              Text(itemLabel(item)),
            ],
          ),
        );
      }).toList(),
      onChanged: onChanged,
    );
  }
}

IconData _accountIcon(AccountType type) => switch (type) {
      AccountType.checking => Icons.account_balance,
      AccountType.savings => Icons.savings,
      AccountType.investment => Icons.trending_up,
      AccountType.cash => Icons.payments,
      AccountType.other => Icons.account_balance_wallet,
    };
