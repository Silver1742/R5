import Modal from "./Modal";

export default function ConfirmModal({ title, message, confirmLabel = "Confirmar", onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn-neon-outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-neon" style={{ background: "var(--danger)" }} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="mb-0">{message}</p>
    </Modal>
  );
}
