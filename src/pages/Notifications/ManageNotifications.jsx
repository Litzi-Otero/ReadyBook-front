import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import MainLayout from "../../layouts/MainLayout";
import { getReservedUserBooks, getWaitingListBooks, getReservedBooks } from "../../services/authService";
import "./ManageNotifications.css";

const ManageNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.userId;

        if (!userId) {
          throw new Error("Debes iniciar sesión para ver tus notificaciones");
        }

        // Obtener libros reservados
        const reservedBooksData = await getReservedUserBooks(null, { reservedBy: userId });
        const reservedNotifications = reservedBooksData.map((book) => ({
          id: book.id,
          type: "reserved",
          message: `Tu reserva de '${book.title}' está activa`,
          date: new Date(book.reservedAt).toLocaleDateString(),
          reservedUntil: new Date(book.reservedUntil),
          timeLeft: calculateTimeLeft(new Date(book.reservedUntil)),
        }));

        // Obtener libros en lista de espera y verificar disponibilidad
        const waitingListBooksData = await getWaitingListBooks(userId);
        const waitingNotifications = await Promise.all(
          waitingListBooksData.map(async (book) => {
            const reserved = await getReservedBooks(book.title);
            const isAvailable = reserved.length === 0;
            return {
              id: book.id,
              type: "waiting",
              message: isAvailable
                ? `El libro '${book.title}' que tenías en espera ya está disponible`
                : `Estás en la lista de espera para '${book.title}'`,
              date: new Date(book.waitingSince).toLocaleDateString(),
              reservedUntil: isAvailable ? null : new Date(book.reservedUntil),
              timeLeft: isAvailable ? "Disponible ahora" : `Disponible después de ${new Date(book.reservedUntil).toLocaleDateString()}`,
            };
          })
        );

        // Combinar notificaciones
        setNotifications([...reservedNotifications, ...waitingNotifications]);
      } catch (err) {
        setError(err.message || "Error al cargar las notificaciones");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Función para calcular el tiempo restante
  const calculateTimeLeft = (reservedUntil) => {
    const now = new Date();
    const timeDiff = reservedUntil - now;

    if (timeDiff <= 0) {
      return "Venció";
    }

    const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (daysLeft > 0) {
      return `Faltan ${daysLeft} día${daysLeft > 1 ? "s" : ""}`;
    } else if (hoursLeft > 0) {
      return `Faltan ${hoursLeft} hora${hoursLeft > 1 ? "s" : ""}`;
    } else {
      return `Faltan ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}`;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="notifications-container">
          <h2>Notificaciones</h2>
          <p>Cargando...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="notifications-container">
          <h2>Notificaciones</h2>
          <p className="error-message">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="notifications-container">
        <h2>Notificaciones</h2>
        {notifications.length === 0 ? (
          <p className="no-notifications">No tienes notificaciones actualmente.</p>
        ) : (
          <div className="notifications-grid">
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-card">
                <FaBell className="notification-icon" />
                <div>
                  <p>{notification.message}</p>
                  <small>
                    {notification.type === "reserved" ? "Reservado el" : "En espera desde"}: {notification.date}
                  </small>
                  <p className={`time-left ${notification.timeLeft === "Disponible ahora" ? "available" : ""}`}>
                    {notification.timeLeft}
                    {notification.reservedUntil && ` (Hasta: ${notification.reservedUntil.toLocaleDateString()})`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManageNotifications;