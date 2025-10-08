import { selectQuery, executeQuery, getDatabase } from '../db/client';

export async function getMonthlyIssues(yearMonth) {
  let query = `
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
      i.issued_at
    FROM issues i
    JOIN items it ON i.item_id = it.id
    JOIN workers w ON i.worker_id = w.id
    JOIN departments d ON w.department_id = d.id
    WHERE i.is_active = 1
  `;

  const params = [];

  if (yearMonth) {
    query += ` AND strftime('%Y-%m', i.issued_at) = ?`;
    params.push(yearMonth);
  }

  query += ' ORDER BY i.issued_at DESC';

  return await selectQuery(query, params);
}

export async function createIssue(itemId, workerId, qty, actorUserId) {
  const db = await getDatabase();

  try {
    // Start transaction
    await db.execute('BEGIN TRANSACTION');

    // Check stock availability
    const stockResult = await selectQuery('SELECT qty_on_hand FROM stock_balances WHERE item_id = ?', [itemId]);

    if (stockResult.length === 0 || stockResult[0].qty_on_hand < qty) {
      await db.execute('ROLLBACK');
      throw new Error('Nedovoljno stanja na magacinu');
    }

    // Create issue
    await executeQuery('INSERT INTO issues (item_id, worker_id, qty) VALUES (?, ?, ?)', [itemId, workerId, qty]);

    // Update stock balance
    await executeQuery('UPDATE stock_balances SET qty_on_hand = qty_on_hand - ? WHERE item_id = ?', [qty, itemId]);

    // Log to stock ledger
    await executeQuery(
      'INSERT INTO stock_ledger (item_id, delta_qty, reason, actor_user_id, meta) VALUES (?, ?, ?, ?, ?)',
      [itemId, -qty, 'ISSUE', actorUserId, JSON.stringify({ worker_id: workerId })]
    );

    // Log activity
    await executeQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['issue', 'create_issue', 'issue', null, JSON.stringify({ item_id: itemId, worker_id: workerId, qty }), actorUserId]
    );

    await db.execute('COMMIT');

    return { success: true };
  } catch (error) {
    await db.execute('ROLLBACK');
    return { success: false, error: error.message };
  }
}

export async function updateIssueQty(issueId, newQty, actorUserId) {
  try {
    console.log('updateIssueQty called:', { issueId, newQty, actorUserId });
    
    // Get current issue
    const issueResult = await selectQuery('SELECT * FROM issues WHERE id = ? AND is_active = 1', [issueId]);
    console.log('Issue result:', issueResult);

    if (!issueResult || issueResult.length === 0) {
      console.error('Issue not found');
      return { success: false, error: 'Zaduženje nije pronađeno' };
    }

    const issue = issueResult[0];
    const oldQty = parseFloat(issue.qty);
    const delta = newQty - oldQty;

    console.log('Delta:', delta, 'Old qty:', oldQty, 'New qty:', newQty);

    // Check stock if increasing quantity
    if (delta > 0) {
      const stockResult = await selectQuery('SELECT qty_on_hand FROM stock_balances WHERE item_id = ?', [
        issue.item_id,
      ]);
      console.log('Stock check:', stockResult);

      if (!stockResult || stockResult.length === 0 || stockResult[0].qty_on_hand < delta) {
        console.error('Insufficient stock');
        return { success: false, error: 'Nedovoljno stanja na magacinu' };
      }
    }

    // Sequential updates to avoid lock
    await executeQuery('UPDATE issues SET qty = ? WHERE id = ?', [newQty, issueId]);
    console.log('Issues updated');

    await executeQuery('UPDATE stock_balances SET qty_on_hand = qty_on_hand - ? WHERE item_id = ?', [
      delta,
      issue.item_id,
    ]);
    console.log('Stock updated');

    await executeQuery(
      'INSERT INTO issue_history (issue_id, prev_qty, new_qty, actor_user_id) VALUES (?, ?, ?, ?)',
      [issueId, oldQty, newQty, actorUserId]
    );
    console.log('History logged');

    await executeQuery(
      'INSERT INTO stock_ledger (item_id, delta_qty, reason, actor_user_id, meta) VALUES (?, ?, ?, ?, ?)',
      [issue.item_id, -delta, 'EDIT_ISSUE', actorUserId, JSON.stringify({ issue_id: issueId, old_qty: oldQty })]
    );
    console.log('Ledger logged');

    await executeQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['issue', 'edit_issue', 'issue', issueId, JSON.stringify({ old_qty: oldQty, new_qty: newQty }), actorUserId]
    );
    console.log('Activity logged');

    console.log('Update successful');
    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error: error.message || 'Neuspešna izmena' };
  }
}

export async function deleteIssue(issueId, actorUserId) {
  const db = await getDatabase();

  try {
    await db.execute('BEGIN TRANSACTION');

    // Get current issue
    const issueResult = await selectQuery('SELECT * FROM issues WHERE id = ? AND is_active = 1', [issueId]);

    if (issueResult.length === 0) {
      await db.execute('ROLLBACK');
      throw new Error('Zaduženje nije pronađeno');
    }

    const issue = issueResult[0];

    // Mark issue as inactive
    await executeQuery('UPDATE issues SET is_active = 0 WHERE id = ?', [issueId]);

    // Return stock to balance
    await executeQuery('UPDATE stock_balances SET qty_on_hand = qty_on_hand + ? WHERE item_id = ?', [
      issue.qty,
      issue.item_id,
    ]);

    // Log to stock ledger
    await executeQuery(
      'INSERT INTO stock_ledger (item_id, delta_qty, reason, actor_user_id, meta) VALUES (?, ?, ?, ?, ?)',
      [
        issue.item_id,
        issue.qty,
        'DELETE_ISSUE',
        actorUserId,
        JSON.stringify({ issue_id: issueId, worker_id: issue.worker_id }),
      ]
    );

    // Log activity
    await executeQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['issue', 'delete_issue', 'issue', issueId, JSON.stringify({ worker_id: issue.worker_id, qty: issue.qty }), actorUserId]
    );

    await db.execute('COMMIT');

    return { success: true };
  } catch (error) {
    await db.execute('ROLLBACK');
    return { success: false, error: error.message };
  }
}

export async function returnIssue(itemId, workerId, qty, actorUserId) {
  const db = await getDatabase();

  try {
    await db.execute('BEGIN TRANSACTION');

    // Check if worker has active issue for this item
    const issueResult = await selectQuery(
      'SELECT * FROM issues WHERE item_id = ? AND worker_id = ? AND is_active = 1',
      [itemId, workerId]
    );

    if (issueResult.length === 0) {
      await db.execute('ROLLBACK');
      throw new Error('Radnik nema aktivno zaduženje za ovaj artikal');
    }

    const issue = issueResult[0];

    if (issue.qty < qty) {
      await db.execute('ROLLBACK');
      throw new Error('Količina za vraćanje ne može biti veća od zadužene');
    }

    // Update issue quantity or delete if returning all
    if (issue.qty === qty) {
      await executeQuery('UPDATE issues SET is_active = 0 WHERE id = ?', [issue.id]);
    } else {
      const newQty = issue.qty - qty;
      await executeQuery('UPDATE issues SET qty = ? WHERE id = ?', [newQty, issue.id]);

      // Log to issue history
      await executeQuery(
        'INSERT INTO issue_history (issue_id, prev_qty, new_qty, actor_user_id) VALUES (?, ?, ?, ?)',
        [issue.id, issue.qty, newQty, actorUserId]
      );
    }

    // Return stock to balance
    await executeQuery('UPDATE stock_balances SET qty_on_hand = qty_on_hand + ? WHERE item_id = ?', [qty, itemId]);

    // Log to stock ledger
    await executeQuery(
      'INSERT INTO stock_ledger (item_id, delta_qty, reason, actor_user_id, meta) VALUES (?, ?, ?, ?, ?)',
      [itemId, qty, 'RETURN', actorUserId, JSON.stringify({ worker_id: workerId, issue_id: issue.id })]
    );

    // Log activity
    await executeQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['issue', 'return_item', 'issue', issue.id, JSON.stringify({ worker_id: workerId, qty }), actorUserId]
    );

    await db.execute('COMMIT');

    return { success: true };
  } catch (error) {
    await db.execute('ROLLBACK');
    return { success: false, error: error.message };
  }
}

export async function getIssueHistory(issueId) {
  return await selectQuery(
    `
    SELECT ih.*, u.username
    FROM issue_history ih
    LEFT JOIN users u ON ih.actor_user_id = u.id
    WHERE ih.issue_id = ?
    ORDER BY ih.changed_at DESC
  `,
    [issueId]
  );
}

