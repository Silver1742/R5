import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ title, onClose, children, footer, size = "" }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="modal d-block modal-backdrop-custom" tabIndex={-1} onClick={onClose}>
      <div className={`modal-dialog modal-dialog-centered fade-up ${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content themed">
          <div className="modal-header">
            <h5 className="modal-title font-display">{title}</h5>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
}
