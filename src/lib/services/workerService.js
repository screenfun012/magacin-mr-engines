import { selectQuery, executeQuery } from '../db/client';

export async function getAllWorkers(includeInactive = false) {
  let query = `
    SELECT w.*, d.name as department_name
    FROM workers w
    JOIN departments d ON w.department_id = d.id
  `;

  if (!includeInactive) {
    query += ' WHERE w.is_active = 1';
  }

  query += ' ORDER BY w.first_name, w.last_name';

  return await selectQuery(query);
}

export async function getWorkerById(id) {
  const workers = await selectQuery(
    `
    SELECT w.*, d.name as department_name
    FROM workers w
    JOIN departments d ON w.department_id = d.id
    WHERE w.id = ?
  `,
    [id]
  );
  return workers[0] || null;
}

export async function addWorker(workerData, actorUserId) {
  const { first_name, last_name, department_id } = workerData;

  try {
    await executeQuery('INSERT INTO workers (first_name, last_name, department_id) VALUES (?, ?, ?)', [
      first_name,
      last_name,
      department_id,
    ]);

    const newWorker = await selectQuery('SELECT id FROM workers WHERE first_name = ? AND last_name = ? AND department_id = ?', [
      first_name, last_name, department_id
    ]);

    // Log activity
    await executeQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', 'create_worker', 'worker', newWorker[0]?.id, JSON.stringify({ first_name, last_name, department_id }), actorUserId]
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateWorker(workerId, workerData) {
  const { first_name, last_name, department_id, is_active } = workerData;

  try {
    await executeQuery(
      'UPDATE workers SET first_name = ?, last_name = ?, department_id = ?, is_active = ? WHERE id = ?',
      [first_name, last_name, department_id, is_active ? 1 : 0, workerId]
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function toggleWorkerActive(workerId) {
  try {
    await executeQuery('UPDATE workers SET is_active = NOT is_active WHERE id = ?', [workerId]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllDepartments(includeInactive = false) {
  let query = 'SELECT * FROM departments';

  if (!includeInactive) {
    query += ' WHERE is_active = 1';
  }

  query += ' ORDER BY name';

  return await selectQuery(query);
}

export async function addDepartment(name, actorUserId) {
  try {
    await executeQuery('INSERT INTO departments (name) VALUES (?)', [name]);

    const newDept = await selectQuery('SELECT id FROM departments WHERE name = ?', [name]);

    // Log activity
    await executeQuery(
      'INSERT INTO logs (category, action, entity, entity_id, payload, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', 'create_department', 'department', newDept[0]?.id, JSON.stringify({ name }), actorUserId]
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateDepartment(departmentId, name) {
  try {
    await executeQuery('UPDATE departments SET name = ? WHERE id = ?', [name, departmentId]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function toggleDepartmentActive(departmentId) {
  try {
    await executeQuery('UPDATE departments SET is_active = NOT is_active WHERE id = ?', [departmentId]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

