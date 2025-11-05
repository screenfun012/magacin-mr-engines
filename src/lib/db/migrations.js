import { getDatabase } from './client';

export async function runMigrations() {
  const db = await getDatabase();

  // Create migration version table first
  await db.execute(`
    CREATE TABLE IF NOT EXISTS db_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Read schema and execute
  const schema = `
    -- Departments table
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
    );

    -- Workers table
    CREATE TABLE IF NOT EXISTS workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (department_id) REFERENCES departments(id),
        UNIQUE(first_name, last_name, department_id)
    );

    -- Items table
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT NOT NULL,
        manufacturer_sku TEXT,
        uom TEXT NOT NULL,
        min_qty REAL NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(name, sku)
    );

    -- Stock balances table
    CREATE TABLE IF NOT EXISTS stock_balances (
        item_id INTEGER PRIMARY KEY,
        qty_on_hand REAL DEFAULT 0,
        FOREIGN KEY (item_id) REFERENCES items(id)
    );

    -- Stock ledger table
    CREATE TABLE IF NOT EXISTS stock_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        delta_qty REAL NOT NULL,
        reason TEXT NOT NULL CHECK(reason IN ('ADD_STOCK', 'ISSUE', 'RETURN', 'EDIT_ISSUE', 'DELETE_ISSUE', 'ADJUSTMENT')),
        actor_user_id INTEGER,
        meta TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (item_id) REFERENCES items(id),
        FOREIGN KEY (actor_user_id) REFERENCES users(id)
    );

    -- Issues table
    CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        worker_id INTEGER NOT NULL,
        qty REAL NOT NULL,
        issued_at TEXT DEFAULT (datetime('now')),
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (item_id) REFERENCES items(id),
        FOREIGN KEY (worker_id) REFERENCES workers(id)
    );

    -- Issue history table
    CREATE TABLE IF NOT EXISTS issue_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issue_id INTEGER NOT NULL,
        prev_qty REAL NOT NULL,
        new_qty REAL NOT NULL,
        actor_user_id INTEGER,
        changed_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (issue_id) REFERENCES issues(id),
        FOREIGN KEY (actor_user_id) REFERENCES users(id)
    );

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
    );

    -- Logs table
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        action TEXT NOT NULL,
        entity TEXT,
        entity_id INTEGER,
        actor_user_id INTEGER,
        payload TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (actor_user_id) REFERENCES users(id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_workers_department ON workers(department_id);
    CREATE INDEX IF NOT EXISTS idx_issues_item ON issues(item_id);
    CREATE INDEX IF NOT EXISTS idx_issues_worker ON issues(worker_id);
    CREATE INDEX IF NOT EXISTS idx_issues_issued_at ON issues(issued_at);
    CREATE INDEX IF NOT EXISTS idx_stock_ledger_item ON stock_ledger(item_id);
    CREATE INDEX IF NOT EXISTS idx_stock_ledger_created_at ON stock_ledger(created_at);
    CREATE INDEX IF NOT EXISTS idx_logs_category ON logs(category);
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_logs_actor ON logs(actor_user_id);
  `;

  const statements = schema.split(';').filter((stmt) => stmt.trim() !== '');

  for (const statement of statements) {
    await db.execute(statement);
  }

  // Create view for monthly issues
  await db.execute(`
    CREATE VIEW IF NOT EXISTS v_monthly_issues AS
    SELECT 
        i.id,
        i.item_id,
        it.name as item_name,
        it.sku,
        it.uom,
        i.worker_id,
        w.first_name,
        w.last_name,
        d.name as department_name,
        i.qty,
        i.issued_at,
        strftime('%Y-%m', i.issued_at) as month_year
    FROM issues i
    JOIN items it ON i.item_id = it.id
    JOIN workers w ON i.worker_id = w.id
    JOIN departments d ON w.department_id = d.id
    WHERE i.is_active = 1
  `);

  // Migration 1: Add new fields to items table (prodajna_cena, nabavna_cena, proizvodjac)
  try {
    // Check if columns exist
    const columns = await db.select('PRAGMA table_info(items)');
    const columnNames = columns.map((col) => col.name);
    
    if (!columnNames.includes('prodajna_cena')) {
      await db.execute('ALTER TABLE items ADD COLUMN prodajna_cena REAL DEFAULT 0');
      console.log('✅ Added prodajna_cena column');
    }
    
    if (!columnNames.includes('nabavna_cena')) {
      await db.execute('ALTER TABLE items ADD COLUMN nabavna_cena REAL DEFAULT 0');
      console.log('✅ Added nabavna_cena column');
    }
    
    if (!columnNames.includes('proizvodjac')) {
      await db.execute('ALTER TABLE items ADD COLUMN proizvodjac TEXT');
      console.log('✅ Added proizvodjac column');
    }
  } catch (error) {
    // Columns might already exist, ignore error
    console.log('Migration check:', error.message);
  }

  console.log('Migrations completed successfully');
}
