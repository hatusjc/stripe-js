import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/entities/credit_card_entity.dart';
import '../../providers/credit_card_provider.dart';

class CreditCardsScreen extends ConsumerWidget {
  const CreditCardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(creditCardsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Cartões de Crédito')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Novo Cartão'),
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (cards) {
          if (cards.isEmpty) {
            return _EmptyState(onAdd: () => _showForm(context, ref));
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(creditCardsProvider.notifier).refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              itemCount: cards.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (ctx, i) => _CardTile(
                card: cards[i],
                onEdit: () => _showForm(context, ref, existing: cards[i]),
                onDelete: () => _confirmDelete(context, ref, cards[i]),
              ),
            ),
          );
        },
      ),
    );
  }

  void _showForm(BuildContext context, WidgetRef ref, {CreditCardEntity? existing}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _CardFormSheet(existing: existing, ref: ref),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref, CreditCardEntity card) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Excluir cartão'),
        content: Text('Deseja excluir "${card.name}"?'),
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
    if (ok == true) await ref.read(creditCardsProvider.notifier).delete(card.id);
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
          const Icon(Icons.credit_card_outlined, size: 72, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Nenhum cartão cadastrado', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Text('Cadastre seu cartão para controlar faturas', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Adicionar cartão'),
          ),
        ],
      ),
    );
  }
}

class _CardTile extends StatelessWidget {
  const _CardTile({required this.card, required this.onEdit, required this.onDelete});
  final CreditCardEntity card;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [card.color, card.color.withAlpha(180)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: card.color.withAlpha(80), blurRadius: 12, offset: const Offset(0, 6))],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(card.name, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              Row(
                children: [
                  IconButton(icon: const Icon(Icons.edit_outlined, color: Colors.white70, size: 18), onPressed: onEdit, padding: EdgeInsets.zero),
                  IconButton(icon: const Icon(Icons.delete_outline, color: Colors.white70, size: 18), onPressed: onDelete, padding: EdgeInsets.zero),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            card.lastFour != null ? '**** **** **** ${card.lastFour}' : '**** **** **** ****',
            style: const TextStyle(color: Colors.white, fontSize: 16, letterSpacing: 2),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _InfoChip(label: 'Limite', value: _fmt(card.creditLimitCents)),
              _InfoChip(label: 'Fechamento', value: 'Dia ${card.closingDay}'),
              _InfoChip(label: 'Vencimento', value: 'Dia ${card.dueDay}'),
            ],
          ),
          if (card.brand != null) ...[
            const SizedBox(height: 8),
            Text(_brandLabel(card.brand!), style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ],
        ],
      ),
    );
  }

  String _fmt(int cents) {
    final v = cents / 100;
    return 'R\$ ${v.toStringAsFixed(0).replaceAll(RegExp(r'\B(?=(\d{3})+(?!\d))'), '.')}';
  }

  String _brandLabel(CardBrand b) => switch (b) {
    CardBrand.visa => 'Visa',
    CardBrand.mastercard => 'Mastercard',
    CardBrand.amex => 'American Express',
    CardBrand.elo => 'Elo',
    CardBrand.hipercard => 'Hipercard',
    CardBrand.other => 'Outro',
  };
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _CardFormSheet extends StatefulWidget {
  const _CardFormSheet({this.existing, required this.ref});
  final CreditCardEntity? existing;
  final WidgetRef ref;

  @override
  State<_CardFormSheet> createState() => _CardFormSheetState();
}

class _CardFormSheetState extends State<_CardFormSheet> {
  final _nameCtrl = TextEditingController();
  final _limitCtrl = TextEditingController();
  final _lastFourCtrl = TextEditingController();
  int _closingDay = 1;
  int _dueDay = 10;
  CardBrand? _brand;
  Color _color = AppColors.seed;
  bool _loading = false;

  static const _colors = [
    Color(0xFF1E6B4C), Color(0xFF2C3E50), Color(0xFF8E44AD),
    Color(0xFF2980B9), Color(0xFFE74C3C), Color(0xFF16A085),
  ];

  @override
  void initState() {
    super.initState();
    if (widget.existing != null) {
      final c = widget.existing!;
      _nameCtrl.text = c.name;
      _limitCtrl.text = (c.creditLimitCents / 100).toStringAsFixed(0);
      _lastFourCtrl.text = c.lastFour ?? '';
      _closingDay = c.closingDay;
      _dueDay = c.dueDay;
      _brand = c.brand;
      _color = c.color;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _limitCtrl.dispose();
    _lastFourCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameCtrl.text.trim();
    final limit = double.tryParse(_limitCtrl.text.trim().replaceAll('.', '').replaceAll(',', '.'));
    if (name.isEmpty || limit == null || limit <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preencha nome e limite')));
      return;
    }
    final lastFour = _lastFourCtrl.text.trim();
    setState(() => _loading = true);
    final notifier = widget.ref.read(creditCardsProvider.notifier);

    if (widget.existing == null) {
      final result = await notifier.create(
        name: name,
        creditLimitCents: (limit * 100).round(),
        closingDay: _closingDay,
        dueDay: _dueDay,
        color: _color,
        lastFour: lastFour.isNotEmpty ? lastFour : null,
        brand: _brand,
      );
      if (!mounted) return;
      result.fold(
        (f) { setState(() => _loading = false); ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(f.message))); },
        (_) => Navigator.pop(context),
      );
    } else {
      final updated = widget.existing!.copyWith(
        name: name,
        creditLimitCents: (limit * 100).round(),
        closingDay: _closingDay,
        dueDay: _dueDay,
        color: _color,
        lastFour: lastFour.isNotEmpty ? lastFour : null,
        brand: _brand,
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
            Text(widget.existing == null ? 'Novo Cartão' : 'Editar Cartão',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Nome do cartão', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(
              controller: _limitCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Limite (R\$)', prefixText: 'R\$ ', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _lastFourCtrl,
              keyboardType: TextInputType.number,
              maxLength: 4,
              decoration: const InputDecoration(labelText: 'Últimos 4 dígitos (opcional)', border: OutlineInputBorder(), counterText: ''),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<CardBrand?>(
              value: _brand,
              decoration: const InputDecoration(labelText: 'Bandeira', border: OutlineInputBorder()),
              items: [
                const DropdownMenuItem<CardBrand?>(value: null, child: Text('Não informada')),
                ...CardBrand.values.map((b) => DropdownMenuItem(value: b, child: Text(_brandLabel(b)))),
              ],
              onChanged: (v) => setState(() => _brand = v),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _DayPicker(label: 'Fechamento', value: _closingDay, onChanged: (v) => setState(() => _closingDay = v))),
                const SizedBox(width: 12),
                Expanded(child: _DayPicker(label: 'Vencimento', value: _dueDay, onChanged: (v) => setState(() => _dueDay = v))),
              ],
            ),
            const SizedBox(height: 12),
            const Text('Cor do cartão', style: TextStyle(fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 10,
              children: _colors.map((c) => GestureDetector(
                onTap: () => setState(() => _color = c),
                child: CircleAvatar(backgroundColor: c, radius: 18,
                    child: _color == c ? const Icon(Icons.check, color: Colors.white, size: 16) : null),
              )).toList(),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(widget.existing == null ? 'Adicionar Cartão' : 'Salvar'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _brandLabel(CardBrand b) => switch (b) {
    CardBrand.visa => 'Visa',
    CardBrand.mastercard => 'Mastercard',
    CardBrand.amex => 'American Express',
    CardBrand.elo => 'Elo',
    CardBrand.hipercard => 'Hipercard',
    CardBrand.other => 'Outro',
  };
}

class _DayPicker extends StatelessWidget {
  const _DayPicker({required this.label, required this.value, required this.onChanged});
  final String label;
  final int value;
  final void Function(int) onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<int>(
      value: value,
      decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      items: List.generate(28, (i) => i + 1)
          .map((d) => DropdownMenuItem(value: d, child: Text('Dia $d')))
          .toList(),
      onChanged: (v) => onChanged(v!),
    );
  }
}
