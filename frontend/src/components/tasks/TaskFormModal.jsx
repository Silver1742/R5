import { useState } from "react";
import Modal from "../Modal";

const EMPTY = { title: "", description: "", status: "pendiente", priority: "media", due_date: "" };

export default function TaskFormModal({ task, onClose, onSubmit }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(
    task
      ? {
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          due_date: task.due_date ? task.due_date.slice(0, 10) : "",
        }
      : EMPTY
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({ ...form, due_date: form.due_date || null });
    } catch (err) {
      setError(err?.response?.data?.error || "No se pudo guardar la tarea");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Modificar tarea" : "Nueva tarea (Alta)"}
      onClose={onClose}
      footer={
        <>
          <button className="btn-neon-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn-neon" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear tarea"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}

        <div>
          <label className="form-label small text-muted-custom">Título</label>
          <input
            className="form-control"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Ej: Terminar el TP de OAuth"
            autoFocus
          />
        </div>

        <div>
          <label className="form-label small text-muted-custom">Descripción</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Detalles opcionales..."
          />
        </div>

        <div className="row g-3">
          <div className="col-sm-4">
            <label className="form-label small text-muted-custom">Estado</label>
            <select className="form-select" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>
          <div className="col-sm-4">
            <label className="form-label small text-muted-custom">Prioridad</label>
            <select className="form-select" value={form.priority} onChange={(e) => update("priority", e.target.value)}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div className="col-sm-4">
            <label className="form-label small text-muted-custom">Vencimiento</label>
            <input
              type="date"
              className="form-control"
              value={form.due_date}
              onChange={(e) => update("due_date", e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
