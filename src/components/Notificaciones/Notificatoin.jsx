import React from "react";
import "./Notification.css"; // Estilos específicos para el componente

const Notification = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="notification">
      <p>{message}</p>
      <button className="close-notification-btn" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Notification;