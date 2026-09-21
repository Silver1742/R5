const pool = require("../config/db");

const VALID_STATUS = ["pendiente", "en_progreso", "completada"];
const VALID_PRIORITY = ["baja", "media", "alta"];

// Listado: todas las tareas del usuario logueado, con filtro opcional por texto/estado
async function list(req, res) {
  const { q, status } = req.query;
  const params = [req.user.id];
  let sql = "SELECT * FROM tasks WHERE user_id = ?";

  if (q) {
    sql += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  if (status && VALID_STATUS.includes(status)) {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY created_at DESC";

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

// Consulta: detalle de una tarea puntual del usuario logueado
async function getOne(req, res) {
  const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [
    req.params.id,
    req.user.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json(rows[0]);
}

// Alta
async function create(req, res) {
  const { title, description = null, status = "pendiente", priority = "media", due_date = null } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "El título es obligatorio" });
  }
  if (!VALID_STATUS.includes(status) || !VALID_PRIORITY.includes(priority)) {
    return res.status(400).json({ error: "Estado o prioridad inválidos" });
  }

  const [result] = await pool.query(
    "INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.id, title.trim(), description, status, priority, due_date]
  );
  const [created] = await pool.query("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
  res.status(201).json(created[0]);
}

// Modificación
async function update(req, res) {
  const { title, description, status, priority, due_date } = req.body;

  const [existing] = await pool.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [
    req.params.id,
    req.user.id,
  ]);
  if (existing.length === 0) return res.status(404).json({ error: "Tarea no encontrada" });

  if (status && !VALID_STATUS.includes(status)) {
    return res.status(400).json({ error: "Estado inválido" });
  }
  if (priority && !VALID_PRIORITY.includes(priority)) {
    return res.status(400).json({ error: "Prioridad inválida" });
  }

  const current = existing[0];
  await pool.query(
    "UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?",
    [
      title?.trim() || current.title,
      description ?? current.description,
      status || current.status,
      priority || current.priority,
      due_date ?? current.due_date,
      req.params.id,
    ]
  );

  const [updated] = await pool.query("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
  res.json(updated[0]);
}

// Baja: solo se puede eliminar una tarea ya completada
async function remove(req, res) {
  const [existing] = await pool.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [
    req.params.id,
    req.user.id,
  ]);
  if (existing.length === 0) return res.status(404).json({ error: "Tarea no encontrada" });
  if (existing[0].status !== "completada") {
    return res.status(400).json({ error: "Solo se pueden eliminar tareas completadas" });
  }

  await pool.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}

module.exports = { list, getOne, create, update, remove };
