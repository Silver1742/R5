const STATUS_LABEL = { pendiente: "Pendiente", en_progreso: "En progreso", completada: "Completada" };
const PRIORITY_LABEL = { baja: "Baja", media: "Media", alta: "Alta" };

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function TaskTable({ tasks, onView, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state surface">
        <i className="bi bi-inboxes fs-1 d-block mb-2" />
        No hay tareas para mostrar. ¡Creá la primera con "Nueva tarea"!
      </div>
    );
  }

  return (
    <div className="surface task-table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Vencimiento</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} onClick={() => onView(task)}>
              <td className="fw-semibold">{task.title}</td>
              <td>
                <span className={`badge-status ${task.status}`}>{STATUS_LABEL[task.status]}</span>
              </td>
              <td>
                <span className={`badge-priority ${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
              </td>
              <td className="text-muted-custom">{formatDate(task.due_date)}</td>
              <td className="text-end row-actions" onClick={(e) => e.stopPropagation()}>
                <button title="Consultar" onClick={() => onView(task)}>
                  <i className="bi bi-eye" />
                </button>
                <button title="Modificar" onClick={() => onEdit(task)}>
                  <i className="bi bi-pencil-square" />
                </button>
                <button
                  title={task.status === "completada" ? "Eliminar" : "Solo se pueden eliminar tareas completadas"}
                  className="danger"
                  disabled={task.status !== "completada"}
                  onClick={() => onDelete(task)}
                >
                  <i className="bi bi-trash3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
