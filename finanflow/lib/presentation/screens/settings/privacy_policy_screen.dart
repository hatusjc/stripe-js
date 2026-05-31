import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Política de Privacidade')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: const [
          _Section('Última atualização', '1 de junho de 2025'),
          _Section(
            'Sobre o FinanFlow',
            'O FinanFlow é um aplicativo de gestão financeira pessoal que funciona '
            'completamente offline. Todos os seus dados são armazenados exclusivamente '
            'no seu dispositivo e nunca são enviados a servidores externos.',
          ),
          _Section(
            'Dados coletados',
            'O FinanFlow NÃO coleta, NÃO transmite e NÃO compartilha nenhum dado '
            'pessoal ou financeiro com terceiros.\n\n'
            'Todos os dados que você insere no aplicativo (transações, contas, '
            'categorias, metas, orçamentos etc.) são armazenados localmente no '
            'banco de dados SQLite do seu dispositivo, protegido por criptografia '
            'AES-256-GCM.',
          ),
          _Section(
            'Criptografia e segurança',
            '• Dados sensíveis são criptografados com AES-256-GCM.\n'
            '• A chave de criptografia é armazenada no cofre seguro do sistema '
            'operacional (Android Keystore / iOS Secure Enclave).\n'
            '• O PIN de acesso é armazenado como hash SHA-256 com salt — nunca '
            'em texto simples.\n'
            '• Backups exportados (.ffbk) também são criptografados.',
          ),
          _Section(
            'Permissões do aplicativo',
            '• Biometria: usada apenas para autenticação local.\n'
            '• Notificações: usadas para lembretes de contas a pagar/receber '
            'que você mesmo configura.\n'
            '• Armazenamento: usado apenas para exportar relatórios e backups '
            'para o seu próprio dispositivo.',
          ),
          _Section(
            'Backup e exportação',
            'Os arquivos de backup (.ffbk) e relatórios (PDF, Excel, CSV) são '
            'gerados localmente e ficam na memória do seu dispositivo. '
            'O compartilhamento desses arquivos é feito por você, manualmente, '
            'através das funções de compartilhamento do seu dispositivo. '
            'O FinanFlow não acessa, envia ou armazena esses arquivos em nenhum servidor.',
          ),
          _Section(
            'Anúncios e rastreamento',
            'O FinanFlow não exibe anúncios e não utiliza nenhuma '
            'ferramenta de rastreamento, analytics ou telemetria.',
          ),
          _Section(
            'Compras no aplicativo',
            'A versão Premium é adquirida através da Google Play Store ou '
            'Apple App Store. O processamento do pagamento é gerenciado '
            'exclusivamente pelas lojas — o FinanFlow não tem acesso aos seus '
            'dados de pagamento.',
          ),
          _Section(
            'Menores de idade',
            'O FinanFlow não é direcionado a menores de 13 anos e não coleta '
            'intencionalmente informações de crianças.',
          ),
          _Section(
            'Alterações nesta política',
            'Qualquer alteração nesta política de privacidade será comunicada '
            'através de uma atualização no aplicativo.',
          ),
          _Section(
            'Contato',
            'Dúvidas sobre privacidade? Entre em contato:\n'
            'suporte@finanflow.app',
          ),
          SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.title, this.body);
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: cs.primary),
          ),
          const SizedBox(height: 6),
          Text(body, style: const TextStyle(fontSize: 14, height: 1.6)),
        ],
      ),
    );
  }
}
