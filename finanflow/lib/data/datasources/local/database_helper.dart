import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import '../../../core/constants/db_constants.dart';
import '../../../core/constants/app_constants.dart';

class DatabaseHelper {
  DatabaseHelper._();
  static final DatabaseHelper instance = DatabaseHelper._();

  Database? _db;

  Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, DbConstants.dbName);
    return openDatabase(
      path,
      version: DbConstants.dbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
      onOpen: _onOpen,
    );
  }

  Future<void> _onOpen(Database db) async {
    await db.execute('PRAGMA journal_mode=WAL');
    await db.execute('PRAGMA foreign_keys=ON');
    await db.execute('PRAGMA cache_size=-${AppConstants.dbCacheSizeKb ~/ 4}');
    await db.execute('PRAGMA synchronous=NORMAL');
  }

  Future<void> _onCreate(Database db, int version) async {
    final batch = db.batch();
    for (final sql in _schema) {
      batch.execute(sql);
    }
    await batch.commit(noResult: true);
    await _seedDefaultCategories(db);
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    for (var v = oldVersion + 1; v <= newVersion; v++) {
      final migrations = _migrations[v] ?? [];
      for (final sql in migrations) {
        await db.execute(sql);
      }
    }
  }

  static const List<String> _schema = [
    // ── users ─────────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS users (
      id            TEXT    PRIMARY KEY,
      name          TEXT    NOT NULL,
      email         TEXT,
      avatar_path   TEXT,
      currency_code TEXT    NOT NULL DEFAULT 'BRL',
      locale        TEXT    NOT NULL DEFAULT 'pt',
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    )''',

    // ── settings ──────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS settings (
      id                    TEXT    PRIMARY KEY,
      user_id               TEXT    NOT NULL REFERENCES users(id),
      theme_mode            TEXT    NOT NULL DEFAULT 'system',
      language              TEXT    NOT NULL DEFAULT 'pt',
      currency_code         TEXT    NOT NULL DEFAULT 'BRL',
      biometric_enabled     INTEGER NOT NULL DEFAULT 0,
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      hide_balance          INTEGER NOT NULL DEFAULT 0,
      first_day_of_week     INTEGER NOT NULL DEFAULT 1,
      decimal_separator     TEXT    NOT NULL DEFAULT ',',
      thousands_separator   TEXT    NOT NULL DEFAULT '.',
      onboarding_complete   INTEGER NOT NULL DEFAULT 0,
      plan_type             TEXT    NOT NULL DEFAULT 'free',
      plan_expires_at       INTEGER,
      plan_transaction_id   TEXT,
      updated_at            INTEGER NOT NULL
    )''',

    // ── categories ────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS categories (
      id          TEXT    PRIMARY KEY,
      user_id     TEXT    NOT NULL REFERENCES users(id),
      name        TEXT    NOT NULL,
      type        TEXT    NOT NULL,
      icon_name   TEXT    NOT NULL,
      color       INTEGER NOT NULL,
      is_system   INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      parent_id   TEXT    REFERENCES categories(id),
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL,
      deleted_at  INTEGER
    )''',
    'CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type)',

    // ── accounts ──────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS accounts (
      id                TEXT    PRIMARY KEY,
      user_id           TEXT    NOT NULL REFERENCES users(id),
      name              TEXT    NOT NULL,
      type              TEXT    NOT NULL,
      bank_name         TEXT,
      bank_logo         TEXT,
      initial_balance   INTEGER NOT NULL DEFAULT 0,
      current_balance   INTEGER NOT NULL DEFAULT 0,
      color             INTEGER NOT NULL,
      icon_name         TEXT    NOT NULL,
      currency_code     TEXT    NOT NULL DEFAULT 'BRL',
      include_in_total  INTEGER NOT NULL DEFAULT 1,
      is_active         INTEGER NOT NULL DEFAULT 1,
      sort_order        INTEGER NOT NULL DEFAULT 0,
      created_at        INTEGER NOT NULL,
      updated_at        INTEGER NOT NULL,
      deleted_at        INTEGER
    )''',
    'CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)',

    // ── credit_cards ──────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS credit_cards (
      id              TEXT    PRIMARY KEY,
      user_id         TEXT    NOT NULL REFERENCES users(id),
      account_id      TEXT    REFERENCES accounts(id),
      name            TEXT    NOT NULL,
      last_four       TEXT,
      brand           TEXT,
      credit_limit    INTEGER NOT NULL DEFAULT 0,
      closing_day     INTEGER NOT NULL,
      due_day         INTEGER NOT NULL,
      color           INTEGER NOT NULL,
      icon_name       TEXT,
      is_active       INTEGER NOT NULL DEFAULT 1,
      created_at      INTEGER NOT NULL,
      updated_at      INTEGER NOT NULL,
      deleted_at      INTEGER
    )''',
    'CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id)',

    // ── installments ──────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS installments (
      id                  TEXT    PRIMARY KEY,
      user_id             TEXT    NOT NULL REFERENCES users(id),
      credit_card_id      TEXT    REFERENCES credit_cards(id),
      category_id         TEXT    NOT NULL REFERENCES categories(id),
      description         TEXT    NOT NULL,
      total_amount        INTEGER NOT NULL,
      installment_amount  INTEGER NOT NULL,
      total_count         INTEGER NOT NULL,
      paid_count          INTEGER NOT NULL DEFAULT 0,
      start_date          INTEGER NOT NULL,
      status              TEXT    NOT NULL DEFAULT 'active',
      created_at          INTEGER NOT NULL,
      updated_at          INTEGER NOT NULL
    )''',
    'CREATE INDEX IF NOT EXISTS idx_installments_user_id ON installments(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_installments_credit_card_id ON installments(credit_card_id)',

    // ── transactions ──────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS transactions (
      id              TEXT    PRIMARY KEY,
      user_id         TEXT    NOT NULL REFERENCES users(id),
      account_id      TEXT    REFERENCES accounts(id),
      credit_card_id  TEXT    REFERENCES credit_cards(id),
      category_id     TEXT    NOT NULL REFERENCES categories(id),
      type            TEXT    NOT NULL,
      amount          INTEGER NOT NULL,
      description     TEXT,
      notes           TEXT,
      date            INTEGER NOT NULL,
      is_recurring    INTEGER NOT NULL DEFAULT 0,
      recurrence_rule TEXT,
      recurrence_id   TEXT,
      installment_id  TEXT    REFERENCES installments(id),
      installment_num INTEGER,
      transfer_id     TEXT,
      status          TEXT    NOT NULL DEFAULT 'confirmed',
      tags            TEXT,
      latitude        REAL,
      longitude       REAL,
      created_at      INTEGER NOT NULL,
      updated_at      INTEGER NOT NULL,
      deleted_at      INTEGER
    )''',
    'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_installment_id ON transactions(installment_id)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date, deleted_at)',

    // ── budgets ───────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS budgets (
      id          TEXT    PRIMARY KEY,
      user_id     TEXT    NOT NULL REFERENCES users(id),
      category_id TEXT    REFERENCES categories(id),
      name        TEXT    NOT NULL,
      amount      INTEGER NOT NULL,
      period      TEXT    NOT NULL,
      start_date  INTEGER NOT NULL,
      end_date    INTEGER,
      alert_at    INTEGER NOT NULL DEFAULT 80,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL,
      deleted_at  INTEGER
    )''',
    'CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id)',

    // ── goals ─────────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS goals (
      id                      TEXT    PRIMARY KEY,
      user_id                 TEXT    NOT NULL REFERENCES users(id),
      account_id              TEXT    REFERENCES accounts(id),
      name                    TEXT    NOT NULL,
      description             TEXT,
      type                    TEXT    NOT NULL,
      target_amount           INTEGER NOT NULL,
      current_amount          INTEGER NOT NULL DEFAULT 0,
      target_date             INTEGER,
      icon_name               TEXT,
      color                   INTEGER NOT NULL,
      status                  TEXT    NOT NULL DEFAULT 'active',
      priority                INTEGER NOT NULL DEFAULT 1,
      monthly_contribution    INTEGER,
      created_at              INTEGER NOT NULL,
      updated_at              INTEGER NOT NULL,
      deleted_at              INTEGER
    )''',
    'CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)',

    // ── notifications ─────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS notifications (
      id            TEXT    PRIMARY KEY,
      user_id       TEXT    NOT NULL REFERENCES users(id),
      type          TEXT    NOT NULL,
      title         TEXT    NOT NULL,
      body          TEXT    NOT NULL,
      payload       TEXT,
      scheduled_at  INTEGER NOT NULL,
      delivered_at  INTEGER,
      read_at       INTEGER,
      is_read       INTEGER NOT NULL DEFAULT 0,
      created_at    INTEGER NOT NULL
    )''',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_at)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)',

    // ── reports ───────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS reports (
      id            TEXT    PRIMARY KEY,
      user_id       TEXT    NOT NULL REFERENCES users(id),
      type          TEXT    NOT NULL,
      name          TEXT    NOT NULL,
      period_start  INTEGER NOT NULL,
      period_end    INTEGER NOT NULL,
      filters       TEXT,
      file_path     TEXT,
      file_size     INTEGER,
      created_at    INTEGER NOT NULL
    )''',
    'CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id)',

    // ── backups ───────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS backups (
      id          TEXT    PRIMARY KEY,
      user_id     TEXT    NOT NULL REFERENCES users(id),
      file_path   TEXT    NOT NULL,
      file_size   INTEGER NOT NULL,
      checksum    TEXT    NOT NULL,
      is_auto     INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL
    )''',

    // ── logs ──────────────────────────────────────────────────────────
    '''CREATE TABLE IF NOT EXISTS logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     TEXT    REFERENCES users(id),
      level       TEXT    NOT NULL,
      event       TEXT    NOT NULL,
      message     TEXT,
      payload     TEXT,
      created_at  INTEGER NOT NULL
    )''',
    'CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at)',
  ];

  // Append-only migrations — never modify existing entries
  static const Map<int, List<String>> _migrations = {
    // v2 migrations go here
  };

  Future<void> _seedDefaultCategories(Database db) async {
    const systemUserId = 'system';
    const now = 0;
    final cats = [
      // Expense categories
      _cat('cat_food', systemUserId, 'Alimentação', 'expense', 'restaurant', 0xFFE74C3C, now),
      _cat('cat_transport', systemUserId, 'Transporte', 'expense', 'directions_car', 0xFF3498DB, now),
      _cat('cat_housing', systemUserId, 'Moradia', 'expense', 'home', 0xFF9B59B6, now),
      _cat('cat_health', systemUserId, 'Saúde', 'expense', 'health_and_safety', 0xFF27AE60, now),
      _cat('cat_education', systemUserId, 'Educação', 'expense', 'school', 0xFF1ABC9C, now),
      _cat('cat_leisure', systemUserId, 'Lazer', 'expense', 'sports_esports', 0xFFE67E22, now),
      _cat('cat_subscriptions', systemUserId, 'Assinaturas', 'expense', 'subscriptions', 0xFF8E44AD, now),
      _cat('cat_shopping', systemUserId, 'Compras', 'expense', 'shopping_bag', 0xFFD35400, now),
      _cat('cat_investments', systemUserId, 'Investimentos', 'both', 'trending_up', 0xFF27AE60, now),
      _cat('cat_taxes', systemUserId, 'Impostos', 'expense', 'account_balance', 0xFF7F8C8D, now),
      _cat('cat_other_expense', systemUserId, 'Outros', 'expense', 'more_horiz', 0xFF95A5A6, now),
      // Income categories
      _cat('cat_salary', systemUserId, 'Salário', 'income', 'work', 0xFF2ECC71, now),
      _cat('cat_freelance', systemUserId, 'Freelance', 'income', 'computer', 0xFF3498DB, now),
      _cat('cat_commission', systemUserId, 'Comissão', 'income', 'percent', 0xFF1ABC9C, now),
      _cat('cat_gift', systemUserId, 'Presente', 'income', 'card_giftcard', 0xFFE67E22, now),
      _cat('cat_other_income', systemUserId, 'Outros', 'income', 'more_horiz', 0xFF95A5A6, now),
    ];
    final batch = db.batch();
    for (final cat in cats) {
      batch.insert('categories', cat, conflictAlgorithm: ConflictAlgorithm.ignore);
    }
    await batch.commit(noResult: true);
  }

  static Map<String, dynamic> _cat(
    String id,
    String userId,
    String name,
    String type,
    String icon,
    int color,
    int createdAt,
  ) =>
      {
        'id': id,
        'user_id': userId,
        'name': name,
        'type': type,
        'icon_name': icon,
        'color': color,
        'is_system': 1,
        'is_active': 1,
        'sort_order': 0,
        'created_at': createdAt,
      };

  Future<void> close() async {
    await _db?.close();
    _db = null;
  }
}
