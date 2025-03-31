// src/components/Modal.jsx
import React from "react";
import "./Modal.css";

const Modal = ({
  title,
  children,
  onClose,
  isOpen,
  primaryAction,
  primaryLabel,
  secondaryAction,
  secondaryLabel,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {(primaryAction || secondaryAction) && (
          <div className="modal-footer">
            {secondaryAction && secondaryLabel && (
              <button className="secondary-btn" onClick={secondaryAction} disabled={isLoading}>
                {secondaryLabel}
              </button>
            )}
            {primaryAction && primaryLabel && (
              <button className="primary-btn" onClick={primaryAction} disabled={isLoading}>
                {isLoading ? "Procesando..." : primaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;