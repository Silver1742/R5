import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import TaskTable from "../components/tasks/TaskTable";
import TaskFormModal from "../components/tasks/TaskFormModal";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import ConfirmModal from "../components/ConfirmModal";
import ToastStack from "../components/ToastStack";
import { useToasts } from "../hooks/useToasts";
import api from "../services/api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formTask, setFormTask] = useState(undefined); // undefined = cerrado, null = alta, objeto = edición
  const [detailTask, setDetailTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const { toasts, push } = useToasts();

  async function loadTasks() {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks", { params: { q: search || undefined, status: statusFilter || undefined } });
      setTasks(data);
    } catch {
      push("No se pudieron cargar las tareas", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(loadTasks, 250);
    return () => clearTimeout(timeout);
  }, [search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pendiente: tasks.filter((t) => t.status === "pendiente").length,
      en_progreso: tasks.filter((t) => t.status === "en_progreso").length,
      completada: tasks.filter((t) => t.status === "completada").length,
    }),
    [tasks]
  );

  async function handleSubmitTask(payload) {
    if (formTask && formTask.id) {
      const { data } = await api.put(`/tasks/${formTask.id}`, payload);
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      push("Tarea actualizada");
    } else {
      const { data } = await api.post("/tasks", payload);
      setTasks((prev) => [data, ...prev]);
      push("Tarea creada");
    }
    setFormTask(undefined);
  }

  async function handleDelete() {
    try {
      await api.delete(`/tasks/${taskToDelete.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      push("Tarea eliminada");
    } catch {
      push("No se pudo eliminar la tarea", "error");
    } finally {
      setTaskToDelete(null);
      setDetailTask(null);
    }
  }

  return (
    <>
      <Navbar />
      <ToastStack toasts={toasts} />

      <main className="container" style={{ paddingTop: "6.5rem", paddingBottom: "3rem" }}>
        <div className="dashboard-header fade-up">
          <div>
            <h1 className="h3 fw-bold mb-1">Panel de tareas</h1>
            <p className="text-muted-custom mb-0">Alta, Baja, Modificación, Listado y Consulta (ABMLC)</p>
          </div>
          <button className="btn-neon" onClick={() => setFormTask(null)}>
            <i className="bi bi-plus-lg me-1" /> Nueva tarea
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="surface stat-tile fade-up">
              <div className="stat-value">{stats.total}</div>
              <div className="text-muted-custom small">Total</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="surface stat-tile fade-up">
              <div className="stat-value" style={{ color: "var(--warning)" }}>{stats.pendiente}</div>
              <div className="text-muted-custom small">Pendientes</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="surface stat-tile fade-up">
              <div className="stat-value" style={{ color: "var(--accent)" }}>{stats.en_progreso}</div>
              <div className="text-muted-custom small">En progreso</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="surface stat-tile fade-up">
              <div className="stat-value" style={{ color: "var(--success)" }}>{stats.completada}</div>
              <div className="text-muted-custom small">Completadas</div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          <div className="flex-grow-1" style={{ minWidth: 220 }}>
            <input
              className="form-control"
              placeholder="Buscar por título o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <i className="bi bi-arrow-repeat spin fs-2 text-muted-custom" />
          </div>
        ) : (
          <TaskTable
            tasks={tasks}
            onView={setDetailTask}
            onEdit={(task) => setFormTask(task)}
            onDelete={setTaskToDelete}
          />
        )}
      </main>

      {formTask !== undefined && (
        <TaskFormModal task={formTask} onClose={() => setFormTask(undefined)} onSubmit={handleSubmitTask} />
      )}

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onEdit={() => {
            setFormTask(detailTask);
            setDetailTask(null);
          }}
          onDelete={() => setTaskToDelete(detailTask)}
        />
      )}

      {taskToDelete && (
        <ConfirmModal
          title="Eliminar tarea (Baja)"
          message={`¿Seguro que querés eliminar "${taskToDelete.title}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onClose={() => setTaskToDelete(null)}
        />
      )}
    </>
  );
}
