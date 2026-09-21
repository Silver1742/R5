import Modal from "../Modal";

const STATUS_LABEL = { pendiente: "Pendiente", en_progreso: "En progreso", completada: "Completada" };
const PRIORITY_LABEL = { baja: "Baja", media: "Media", alta: "Alta" };

function formatDate(value) {
  if (!value) return "Sin definir";
  return new Date(value).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function TaskDetailModal({ task, onClose, onEdit, onDelete }) {
  return (
    <Modal
      title="Consulta de tarea"
      onClose={onClose}
      footer={
        <>
          <button className="btn-neon-outline row-actions danger" onClick={onDelete}>
            <i className="bi bi-trash3 me-1" /> Eliminar
          </button>
          <button className="btn-neon" onClick={onEdit}>
            <i className="bi bi-pencil-square me-1" /> Modificar
          </button>
        </>
      }
    >
      <div className="d-flex flex-column gap-3">
        <div>
          <div className="detail-label">Título</div>
          <div className="fs-5 fw-semibold">{task.title}</div>
        </div>

        <div>
          <div className="detail-label">Descripción</div>
          <p className="mb-0">{task.description || <span className="text-muted-custom">Sin descripción</span>}</p>
        </div>

        <div className="row g-3">
          <div className="col-4">
            <div className="detail-label">Estado</div>
            <span className={`badge-status ${task.status}`}>{STATUS_LABEL[task.status]}</span>
          </div>
          <div className="col-4">
            <div className="detail-label">Prioridad</div>
            <span className={`badge-priority ${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
          </div>
          <div className="col-4">
            <div className="detail-label">Vencimiento</div>
            <span>{formatDate(task.due_date)}</span>
          </div>
        </div>

        <div className="text-muted-custom small">
          Creada el {formatDate(task.created_at)}
        </div>
      </div>
    </Modal>
  );
}
