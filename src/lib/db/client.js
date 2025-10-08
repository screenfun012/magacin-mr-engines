import Database from '@tauri-apps/plugin-sql';

let db = null;

export async function initDatabase() {
  if (!db) {
    db = await Database.load('sqlite:app.db');
    console.log('✅ Database initialized');
    console.log('📁 Database location:');
    console.log('   macOS: ~/Library/Application Support/com.mrengines.magacin/app.db');
    console.log('   Windows: %APPDATA%\\com.mrengines.magacin\\app.db');
    console.log('   Linux: ~/.local/share/com.mrengines.magacin/app.db');
    console.log('💾 All data is persisted between sessions');
  }
  return db;
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

export async function executeQuery(query, params = []) {
  const database = await getDatabase();

  // Retry logic for database locked errors
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      return await database.execute(query, params);
    } catch (error) {
      attempts++;
      if (error.message?.includes('database is locked') && attempts < maxAttempts) {
        console.log(`Database locked, retry ${attempts}/${maxAttempts}`);
        await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
        continue;
      }
      throw error;
    }
  }
}

export async function selectQuery(query, params = []) {
  const database = await getDatabase();

  // Retry logic for database locked errors
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      return await database.select(query, params);
    } catch (error) {
      attempts++;
      if (error.message?.includes('database is locked') && attempts < maxAttempts) {
        console.log(`Database locked, retry ${attempts}/${maxAttempts}`);
        await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
        continue;
      }
      throw error;
    }
  }
}
