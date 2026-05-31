import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../providers/bill_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pendingBills = ref.watch(pendingBillsCountProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: ListView(
        children: [
          // ── Contas a Pagar/Receber — destaque ─────────────────────────
          _SectionHeader(label: 'Financeiro'),
          _Tile(
            icon: Icons.receipt_long,
            iconColor: AppColors.transfer,
            title: 'Contas a Pagar / Receber',
            subtitle: pendingBills > 0
                ? '$pendingBills conta${pendingBills > 1 ? 's' : ''} pendente${pendingBills > 1 ? 's' : ''}'
                : 'Nenhuma conta pendente',
            badge: pendingBills > 0 ? '$pendingBills' : null,
            badgeColor: pendingBills > 0 ? AppColors.expense : null,
            onTap: () => context.go('/profile/bills'),
          ),
          _Tile(
            icon: Icons.category_outlined,
            iconColor: AppColors.seed,
            title: 'Categorias',
            subtitle: 'Gerencie suas categorias',
            onTap: () => context.go('/profile/categories'),
          ),
          _Tile(
            icon: Icons.account_balance_wallet_outlined,
            iconColor: AppColors.income,
            title: 'Contas',
            subtitle: 'Contas corrente, poupança, investimentos',
            onTap: () => context.go('/profile/accounts'),
          ),
          _Tile(
            icon: Icons.credit_card,
            iconColor: AppColors.transfer,
            title: 'Cartões de Crédito',
            subtitle: 'Gerencie seus cartões',
            onTap: () => context.go('/profile/cards'),
          ),
          _Tile(
            icon: Icons.flag_outlined,
            iconColor: Colors.amber.shade700,
            title: 'Metas',
            subtitle: 'Objetivos financeiros',
            onTap: () => context.go('/profile/goals'),
          ),
          _Tile(
            icon: Icons.pie_chart_outline,
            iconColor: Colors.purple,
            title: 'Orçamentos',
            subtitle: 'Controle seus gastos por categoria',
            onTap: () => context.go('/profile/budget'),
          ),

          // ── Análise ────────────────────────────────────────────────────
          _SectionHeader(label: 'Análise'),
          _Tile(
            icon: Icons.bar_chart,
            iconColor: AppColors.transfer,
            title: 'Estatísticas',
            subtitle: 'Tendências e análises avançadas',
            onTap: () => context.go('/profile/statistics'),
          ),
          _Tile(
            icon: Icons.calculate_outlined,
            iconColor: Colors.teal,
            title: 'Simulador',
            subtitle: 'Simule investimentos e financiamentos',
            onTap: () => context.go('/profile/simulator'),
          ),

          // ── Configurações ──────────────────────────────────────────────
          _SectionHeader(label: 'Configurações'),
          _Tile(
            icon: Icons.settings_outlined,
            iconColor: Colors.grey,
            title: 'Configurações',
            subtitle: 'Tema, idioma, moeda',
            onTap: () => context.go('/profile/settings'),
          ),
          _Tile(
            icon: Icons.security,
            iconColor: Colors.indigo,
            title: 'Segurança',
            subtitle: 'PIN, biometria',
            onTap: () => context.go('/profile/security'),
          ),
          _Tile(
            icon: Icons.backup_outlined,
            iconColor: Colors.blueGrey,
            title: 'Backup',
            subtitle: 'Exportar e importar dados',
            onTap: () => context.go('/profile/backup'),
          ),

          // ── Legal ──────────────────────────────────────────────────────
          _SectionHeader(label: 'Legal'),
          _Tile(
            icon: Icons.privacy_tip_outlined,
            iconColor: Colors.grey,
            title: 'Política de Privacidade',
            subtitle: 'Como seus dados são protegidos',
            onTap: () => context.go('/profile/privacy'),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
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

class _Tile extends StatelessWidget {
  const _Tile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.badge,
    this.badgeColor,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final String? badge;
  final Color? badgeColor;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: iconColor.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iconColor, size: 22),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
      subtitle:
          Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
      trailing: badge != null
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: badgeColor ?? AppColors.expense,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                badge!,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),
            )
          : const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }
}
