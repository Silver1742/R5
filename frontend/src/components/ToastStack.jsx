export default function ToastStack({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item ${t.type}`}>
          <i className={`bi ${t.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"} me-2`} />
          {t.message}
        </div>
      ))}
    </div>
  );
}
