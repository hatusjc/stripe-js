import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/entities/category_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/category_provider.dart';

class CategoriesScreen extends ConsumerWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Categorias'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Todas'),
              Tab(text: 'Receita'),
              Tab(text: 'Despesa'),
            ],
          ),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _showCategoryForm(context, ref),
          child: const Icon(Icons.add),
        ),
        body: categoriesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Erro: $e')),
          data: (categories) => TabBarView(
            children: [
              _CategoryList(categories: categories, ref: ref),
              _CategoryList(
                categories: categories.where((c) =>
                    c.type == CategoryType.income || c.type == CategoryType.both).toList(),
                ref: ref,
              ),
              _CategoryList(
                categories: categories.where((c) =>
                    c.type == CategoryType.expense || c.type == CategoryType.both).toList(),
                ref: ref,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showCategoryForm(BuildContext context, WidgetRef ref, [CategoryEntity? category]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _CategoryFormSheet(existing: category, ref: ref),
    );
  }
}

class _CategoryList extends StatelessWidget {
  const _CategoryList({required this.categories, required this.ref});
  final List<CategoryEntity> categories;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.category_outlined, size: 56, color: Colors.grey),
            SizedBox(height: 12),
            Text('Nenhuma categoria', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: categories.length,
      itemBuilder: (context, i) {
        final cat = categories[i];
        return _CategoryTile(
          category: cat,
          onEdit: () => showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            useSafeArea: true,
            builder: (_) => _CategoryFormSheet(existing: cat, ref: ref),
          ),
          onDelete: cat.isSystem
              ? null
              : () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Excluir categoria'),
                      content: Text('Deseja excluir "${cat.name}"?'),
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
                    await ref.read(categoriesProvider.notifier).delete(cat.id);
                  }
                },
        );
      },
    );
  }
}

class _CategoryTile extends StatelessWidget {
  const _CategoryTile({
    required this.category,
    required this.onEdit,
    this.onDelete,
  });

  final CategoryEntity category;
  final VoidCallback onEdit;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: category.color.withValues(alpha: 0.15),
        child: Icon(
          _iconFromName(category.iconName),
          color: category.color,
          size: 22,
        ),
      ),
      title: Text(category.name),
      subtitle: Text(
        _typeLabel(category.type),
        style: Theme.of(context).textTheme.bodySmall,
      ),
      trailing: category.isSystem
          ? const Chip(
              label: Text('Sistema'),
              visualDensity: VisualDensity.compact,
            )
          : PopupMenuButton<String>(
              onSelected: (v) {
                if (v == 'edit') onEdit();
                if (v == 'delete') onDelete?.call();
              },
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'edit', child: Text('Editar')),
                PopupMenuItem(value: 'delete', child: Text('Excluir')),
              ],
            ),
    );
  }

  String _typeLabel(CategoryType t) => switch (t) {
        CategoryType.income => 'Receita',
        CategoryType.expense => 'Despesa',
        CategoryType.both => 'Receita e Despesa',
      };
}

// ─── Form sheet ─────────────────────────────────────────────────────────────

class _CategoryFormSheet extends StatefulWidget {
  const _CategoryFormSheet({this.existing, required this.ref});
  final CategoryEntity? existing;
  final WidgetRef ref;

  @override
  State<_CategoryFormSheet> createState() => _CategoryFormSheetState();
}

class _CategoryFormSheetState extends State<_CategoryFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  CategoryType _type = CategoryType.expense;
  String _iconName = 'label';
  Color _color = AppColors.chartPalette.first;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _nameCtrl = TextEditingController(text: e?.name ?? '');
    if (e != null) {
      _type = e.type;
      _iconName = e.iconName;
      _color = e.color;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final notifier = widget.ref.read(categoriesProvider.notifier);
    if (widget.existing == null) {
      await notifier.create(
        name: _nameCtrl.text,
        type: _type,
        iconName: _iconName,
        color: _color,
      );
    } else {
      await notifier.save(
        widget.existing!.copyWith(
          name: _nameCtrl.text,
          type: _type,
          iconName: _iconName,
          color: _color,
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.existing == null ? 'Nova Categoria' : 'Editar Categoria',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Nome',
                border: OutlineInputBorder(),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Digite um nome' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<CategoryType>(
              value: _type,
              decoration: const InputDecoration(
                labelText: 'Tipo',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(
                    value: CategoryType.expense, child: Text('Despesa')),
                DropdownMenuItem(
                    value: CategoryType.income, child: Text('Receita')),
                DropdownMenuItem(
                    value: CategoryType.both,
                    child: Text('Receita e Despesa')),
              ],
              onChanged: (v) => setState(() => _type = v!),
            ),
            const SizedBox(height: 16),
            Text('Ícone', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 8),
            _IconPicker(
              selected: _iconName,
              onSelected: (v) => setState(() => _iconName = v),
            ),
            const SizedBox(height: 16),
            Text('Cor', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 8),
            _ColorPicker(
              selected: _color,
              onSelected: (c) => setState(() => _color = c),
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
                    : Text(widget.existing == null ? 'Criar' : 'Salvar'),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}

// ─── Icon picker ────────────────────────────────────────────────────────────

const _categoryIcons = <String, IconData>{
  'label': Icons.label,
  'fastfood': Icons.fastfood,
  'directions_car': Icons.directions_car,
  'home': Icons.home,
  'local_hospital': Icons.local_hospital,
  'school': Icons.school,
  'shopping_bag': Icons.shopping_bag,
  'sports': Icons.sports,
  'movie': Icons.movie,
  'flight': Icons.flight,
  'attach_money': Icons.attach_money,
  'work': Icons.work,
  'pets': Icons.pets,
  'fitness_center': Icons.fitness_center,
  'restaurant': Icons.restaurant,
  'local_gas_station': Icons.local_gas_station,
  'phone': Icons.phone,
  'wifi': Icons.wifi,
  'savings': Icons.savings,
  'card_giftcard': Icons.card_giftcard,
};

class _IconPicker extends StatelessWidget {
  const _IconPicker({required this.selected, required this.onSelected});
  final String selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _categoryIcons.entries.map((e) {
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

// ─── Color picker ────────────────────────────────────────────────────────────

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

IconData _iconFromName(String name) =>
    _categoryIcons[name] ?? Icons.label;
