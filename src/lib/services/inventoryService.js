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
  const {
    name,
    sku,
    manufacturer_sku,
    uom,
    min_qty,
    initial_qty,
    prodajna_cena,
    nabavna_cena,
    proizvodjac,
  } = itemData;

  try {
    // Check if item already exists
    const existing = await selectQuery('SELECT id FROM items WHERE name = ? AND sku = ?', [name, sku]);

    if (existing.length > 0) {
      throw new Error('Artikal sa ovim nazivom i kataloskim brojem vec postoji');
    }

    // Insert item
    await executeQuery(
      'INSERT INTO items (name, sku, manufacturer_sku, uom, min_qty, prodajna_cena, nabavna_cena, proizvodjac) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        sku,
        manufacturer_sku || null,
        uom,
        min_qty || 0,
        prodajna_cena || 0,
        nabavna_cena || 0,
        proizvodjac || null,
      ]
    );

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

export async function deleteItem(itemId, actorUserId) {
  try {
    // Check if item exists
    const item = await getItemById(itemId);
    if (!item) {
      throw new Error('Artikal nije pronađen');
    }

    // Check if item has active issues (zaduženja)
    const activeIssues = await selectQuery('SELECT COUNT(*) as count FROM issues WHERE item_id = ? AND is_active = 1', [
      itemId,
    ]);

    if (activeIssues[0].count > 0) {
      throw new Error(`Ne možete obrisati artikal koji ima aktivna zaduženja. Molimo prvo razdužite sve radnike.`);
    }

    // Store item info for logging
    const itemInfo = {
      name: item.name,
      sku: item.sku,
      qty_on_hand: item.qty_on_hand,
    };

    // Temporarily disable foreign keys to allow deletion
    await executeQuery('PRAGMA foreign_keys = OFF');

    try {
      // Delete in correct order
      // 1. Delete stock ledger entries
      await executeQuery('DELETE FROM stock_ledger WHERE item_id = ?', [itemId]);

      // 2. Delete stock balance
      await executeQuery('DELETE FROM stock_balances WHERE item_id = ?', [itemId]);

      // 3. Delete issue history (only for inactive issues)
      await executeQuery(
        'DELETE FROM issue_history WHERE issue_id IN (SELECT id FROM issues WHERE item_id = ? AND is_active = 0)',
        [itemId]
      );

      // 4. Delete ONLY inactive issues (active issues were already checked and should be 0)
      await executeQuery('DELETE FROM issues WHERE item_id = ? AND is_active = 0', [itemId]);

      // 5. Delete the item itself
      await executeQuery('DELETE FROM items WHERE id = ?', [itemId]);

      // Log activity
      await executeQuery(
        'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
        ['inventory', 'delete_item', 'item', itemId, JSON.stringify(itemInfo), actorUserId]
      );
    } finally {
      // Re-enable foreign keys
      await executeQuery('PRAGMA foreign_keys = ON');
    }

    return { success: true };
  } catch (error) {
    // Make sure foreign keys are re-enabled even if there's an error
    try {
      await executeQuery('PRAGMA foreign_keys = ON');
    } catch (e) {
      console.error('Failed to re-enable foreign keys:', e);
    }
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
