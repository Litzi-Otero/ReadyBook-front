import React from "react";
import { FaTimesCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"; // Íconos específicos
import "./Notification.css";

const Notification = ({ message, onClose }) => {
  if (!message) return null;

  // Función para determinar el tipo de notificación según el mensaje
  const getNotificationType = (msg) => {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("error") || lowerMsg.includes("no se") || lowerMsg.includes("intenta")) {
      return "error"; // Rojo para errores
    } else if (lowerMsg.includes("exitosamente") || lowerMsg.includes("éxito")) {
      return "success"; // Verde para éxito
    } else {
      return "warning"; // Naranja para advertencias
    }
  };

  const notificationType = getNotificationType(message);

  // Mapa de íconos según el tipo
  const icons = {
    error: <FaTimesCircle />,
    success: <FaCheckCircle />,
    warning: <FaExclamationTriangle />,
  };

  const Icon = icons[notificationType];

  return (
    <div className={`notification ${notificationType}`}>
      <div className="notification-icon-wrapper">
        {Icon}
      </div>
      <div className="notification-content">
        <h3 className="notification-title">Notificación</h3>
        <p className="notification-message">{message}</p>
      </div>
      <button className="open-btn" onClick={onClose}>
        Aceptar
      </button>
    </div>
  );
};

export default Notification;