import { selectQuery, executeQuery } from '../db/client';

export async function getAllItems() {
  return await selectQuery(`
    SELECT i.*, sb.qty_on_hand
    FROM items i
    LEFT JOIN stock_balances sb ON i.id = sb.item_id
    ORDER BY i.name
  `);
}

export async function getItemById(id) {
  const items = await selectQuery(
    `
    SELECT i.*, sb.qty_on_hand
    FROM items i
    LEFT JOIN stock_balances sb ON i.id = sb.item_id
    WHERE i.id = ?
  `,
    [id]
  );
  return items[0] || null;
}

export async function getLowStockItems() {
  return await selectQuery(`
    SELECT i.*, sb.qty_on_hand
    FROM items i
    LEFT JOIN stock_balances sb ON i.id = sb.item_id
    WHERE sb.qty_on_hand <= i.min_qty
    ORDER BY i.name
  `);
}

export async function addItem(itemData, actorUserId) {
  const { name, sku, manufacturer_sku, uom, min_qty, initial_qty } = itemData;

  try {
    // Check if item already exists
    const existing = await selectQuery('SELECT id FROM items WHERE name = ? AND sku = ?', [name, sku]);

    if (existing.length > 0) {
      throw new Error('Artikal sa ovim nazivom i kataloskim brojem vec postoji');
    }

    // Insert item
    await executeQuery('INSERT INTO items (name, sku, manufacturer_sku, uom, min_qty) VALUES (?, ?, ?, ?, ?)', [
      name,
      sku,
      manufacturer_sku || null,
      uom,
      min_qty,
    ]);

    const newItem = await selectQuery('SELECT id FROM items WHERE sku = ?', [sku]);
    const itemId = newItem[0].id;

    // Initialize stock balance
    await executeQuery('INSERT INTO stock_balances (item_id, qty_on_hand) VALUES (?, ?)', [itemId, initial_qty || 0]);

    // Log to stock ledger
    if (initial_qty > 0) {
      await executeQuery(
        'INSERT INTO stock_ledger (item_id, delta_qty, reason, actor_user_id, meta) VALUES (?, ?, ?, ?, ?)',
        [itemId, initial_qty, 'ADD_STOCK', actorUserId, JSON.stringify({ note: 'Initial stock' })]
      );
    }

    // Log activity
    await executeQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['inventory', 'create_item', 'item', itemId, JSON.stringify({ name, sku, qty: initial_qty }), actorUserId]
    );

    return { success: true, itemId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function addStockToExistingItem(itemId, qty, actorUserId) {
  try {
    // Update stock balance
    await executeQuery('UPDATE stock_balances SET qty_on_hand = qty_on_hand + ? WHERE item_id = ?', [qty, itemId]);

    // Log to stock ledger
    await executeQuery(
      'INSERT INTO stock_ledger (item_id, delta_qty, reason, actor_user_id, meta) VALUES (?, ?, ?, ?, ?)',
      [itemId, qty, 'ADD_STOCK', actorUserId, JSON.stringify({ note: 'Stock replenishment' })]
    );

    // Log activity
    await executeQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['inventory', 'add_stock', 'item', itemId, JSON.stringify({ qty }), actorUserId]
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getStockLedger(itemId = null, limit = 100) {
  let query = `
    SELECT sl.*, i.name as item_name, i.sku, u.username
    FROM stock_ledger sl
    JOIN items i ON sl.item_id = i.id
    LEFT JOIN users u ON sl.actor_user_id = u.id
  `;

  const params = [];

  if (itemId) {
    query += ' WHERE sl.item_id = ?';
    params.push(itemId);
  }

  query += ' ORDER BY sl.created_at DESC LIMIT ?';
  params.push(limit);

  return await selectQuery(query, params);
}

