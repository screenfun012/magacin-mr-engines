import { getDatabase } from './client';

export async function seedDatabase() {
  const db = await getDatabase();

  try {
    // Check if seed version 1 already applied
    const versionCheck = await db.select('SELECT version FROM db_version WHERE version = 1');
    if (versionCheck.length > 0) {
      console.log('Database already seeded (version 1 applied)');
      return;
    }
  } catch (error) {
    console.log('Error checking seed version, will attempt to seed...');
  }

  try {
    // Double check - if users exist, don't seed
    const usersCount = await db.select('SELECT COUNT(*) as count FROM users');
    if (usersCount[0].count > 0) {
      console.log('Database already has users, marking as seeded');
      await db.execute('INSERT OR IGNORE INTO db_version (version) VALUES (1)');
      return;
    }
  } catch (error) {
    console.log('Continuing with initial seed...');
  }

  console.log('Starting database seeding (version 1)...');
  console.log('🏭 PRODUCTION BUILD - Creating admin user only');

  // Create only admin user for production
  try {
    await db.execute('INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
      'admin',
      'admin123',
      'admin',
    ]);
    console.log('✅ Admin user created');
  } catch (error) {
    console.log('Admin user already exists, skipping...');
  }

  // Mark seed version 1 as applied
  await db.execute('INSERT INTO db_version (version) VALUES (1)');

  console.log('📝 Seed completed - database is completely empty and ready for use');
  console.log('👤 Login with: admin / admin123');
  console.log('✨ Application is ready for production use - no test data included');

  // Log seed completion
  await db.execute('INSERT INTO logs (category, action, entity, payload, actor_user_id) VALUES (?, ?, ?, ?, ?)', [
    'system',
    'seed',
    'database',
    JSON.stringify({ status: 'completed', version: 1 }),
    1,
  ]);

  // Mark seed version 1 as applied
  await db.execute('INSERT INTO db_version (version) VALUES (1)');

  console.log('Database seeding (version 1) completed successfully');
}
