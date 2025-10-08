import { selectQuery } from '../db/client';

async function logLogin(username, userId) {
  try {
    await selectQuery(
      'INSERT INTO logs (category, action, entity, payload, actor_user_id) VALUES (?, ?, ?, ?, ?)',
      ['auth', 'login', 'user', JSON.stringify({ username }), userId]
    );
  } catch (error) {
    console.error('Failed to log login:', error);
  }
}

export async function loginUser(username, password) {
  try {
    const users = await selectQuery('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);

    if (users.length === 0) {
      throw new Error('Korisničko ime ili lozinka nisu tačni');
    }

    const user = users[0];
    
    // Simple password check for demo (in production use proper bcrypt server-side)
    const isValidPassword = password === user.password_hash;

    if (!isValidPassword) {
      throw new Error('Korisničko ime ili lozinka nisu tačni');
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    // Log login
    await logLogin(username, user.id);

    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function logAction(category, action, entity, entityId, payload, actorUserId) {
  try {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    await selectQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [category, action, entity, entityId, payloadStr, actorUserId]
    );
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

