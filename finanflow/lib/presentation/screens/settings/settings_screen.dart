import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/settings_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Configurações')),
      body: settingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (settings) => ListView(
          children: [
            // ── Aparência ──────────────────────────────────────────────
            _SectionHeader(label: 'Aparência'),
            ListTile(
              title: const Text('Tema'),
              subtitle: Text(_themeLabel(settings.themeMode)),
              trailing: DropdownButton<AppThemeMode>(
                value: settings.themeMode,
                underline: const SizedBox.shrink(),
                items: AppThemeMode.values.map((m) {
                  return DropdownMenuItem(
                    value: m,
                    child: Text(_themeLabel(m)),
                  );
                }).toList(),
                onChanged: (v) {
                  if (v != null) {
                    ref
                        .read(settingsProvider.notifier)
                        .updateSettings((s) => s.copyWith(themeMode: v));
                  }
                },
              ),
            ),
            SwitchListTile(
              title: const Text('Ocultar saldo'),
              subtitle: const Text('Esconder valores na tela inicial'),
              value: settings.hideBalance,
              onChanged: (v) => ref
                  .read(settingsProvider.notifier)
                  .updateSettings((s) => s.copyWith(hideBalance: v)),
            ),

            // ── Notificações ──────────────────────────────────────────
            _SectionHeader(label: 'Notificações'),
            SwitchListTile(
              title: const Text('Notificações'),
              subtitle:
                  const Text('Ativar ou desativar todas as notificações'),
              value: settings.notificationsEnabled,
              onChanged: (v) => ref
                  .read(settingsProvider.notifier)
                  .updateSettings(
                      (s) => s.copyWith(notificationsEnabled: v)),
            ),
            if (settings.notificationsEnabled) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: Text(
                  'Lembrar contas por padrão',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
                child: Text(
                  'Esses dias serão pré-selecionados ao criar uma nova conta.',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Colors.grey),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _NotificationDaysPicker(
                  selectedDays: settings.billNotificationDays,
                  onChanged: (days) => ref
                      .read(settingsProvider.notifier)
                      .updateSettings(
                          (s) => s.copyWith(billNotificationDays: days)),
                ),
              ),
              const SizedBox(height: 8),
            ],

            // ── Idioma ────────────────────────────────────────────────
            _SectionHeader(label: 'Idioma'),
            ListTile(
              title: const Text('Idioma'),
              subtitle: Text(_languageLabel(settings.language)),
              trailing: DropdownButton<String>(
                value: settings.language,
                underline: const SizedBox.shrink(),
                items: const [
                  DropdownMenuItem(value: 'pt', child: Text('Português')),
                  DropdownMenuItem(value: 'en', child: Text('English')),
                  DropdownMenuItem(value: 'es', child: Text('Español')),
                ],
                onChanged: (v) {
                  if (v != null) {
                    ref
                        .read(settingsProvider.notifier)
                        .updateSettings((s) => s.copyWith(language: v));
                  }
                },
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  String _themeLabel(AppThemeMode m) => switch (m) {
        AppThemeMode.light => 'Claro',
        AppThemeMode.dark => 'Escuro',
        AppThemeMode.amoled => 'AMOLED',
        AppThemeMode.system => 'Sistema',
      };

  String _languageLabel(String l) => switch (l) {
        'pt' => 'Português',
        'en' => 'English',
        'es' => 'Español',
        _ => l,
      };
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 4),
      child: Text(
        label.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Theme.of(context).colorScheme.primary,
              letterSpacing: 1.2,
            ),
      ),
    );
  }
}

class _NotificationDaysPicker extends StatelessWidget {
  const _NotificationDaysPicker({
    required this.selectedDays,
    required this.onChanged,
  });

  final List<int> selectedDays;
  final ValueChanged<List<int>> onChanged;

  static const _days = [3, 2, 1, 0];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      children: _days.map((day) {
        final isSelected = selectedDays.contains(day);
        final label = day == 0
            ? 'No dia'
            : day == 1
                ? '1 dia antes'
                : '$day dias antes';
        return FilterChip(
          label: Text(label),
          selected: isSelected,
          onSelected: (v) {
            final updated = List<int>.from(selectedDays);
            if (v) {
              updated.add(day);
            } else {
              updated.remove(day);
            }
            updated.sort((a, b) => b.compareTo(a));
            onChanged(updated);
          },
        );
      }).toList(),
    );
  }
}
