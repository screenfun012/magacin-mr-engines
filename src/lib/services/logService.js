import { selectQuery } from '../db/client';

export async function getLogs(filters = {}, limit = 100, offset = 0) {
  try {
    let query = `
      SELECT l.*, u.username
      FROM logs l
      LEFT JOIN users u ON l.actor_user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.category) {
      query += ' AND l.category = ?';
      params.push(filters.category);
    }

    if (filters.action) {
      query += ' AND l.action = ?';
      params.push(filters.action);
    }

    if (filters.entity) {
      query += ' AND l.entity = ?';
      params.push(filters.entity);
    }

    if (filters.actor_user_id) {
      query += ' AND l.actor_user_id = ?';
      params.push(filters.actor_user_id);
    }

    if (filters.date_from) {
      query += ' AND l.created_at >= ?';
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND l.created_at <= ?';
      params.push(filters.date_to);
    }

    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await selectQuery(query, params);
    return result || [];
  } catch (error) {
    console.error('Error in getLogs:', error);
    return [];
  }
}

export async function getLogStats() {
  try {
    const stats = await selectQuery(`
      SELECT 
        category,
        COUNT(*) as count
      FROM logs
      GROUP BY category
      ORDER BY count DESC
    `);

    return stats || [];
  } catch (error) {
    console.error('Error in getLogStats:', error);
    return [];
  }
}

