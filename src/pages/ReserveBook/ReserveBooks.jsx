import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Notification from "../../components/Notificaciones/Notificatoin"; // Importamos el componente
import "./ReserveBooks.css";
import MainLayout from "../../layouts/MainLayout";
import { getReservedUserBooks, getWaitingListBooks, cancelReservation, cancelWaitingList } from "../../services/authService";

const ReserveBooks = () => {
  const [reservedBooks, setReservedBooks] = useState([]);
  const [waitingListBooks, setWaitingListBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.userId;

        if (!userId) {
          throw new Error("Debes iniciar sesión para ver tus libros");
        }

        const reservedBooksData = await getReservedUserBooks(null, { reservedBy: userId });
        setReservedBooks(reservedBooksData);

        const waitingListBooksData = await getWaitingListBooks(userId);
        setWaitingListBooks(waitingListBooksData);
      } catch (err) {
        setError(err.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancelReservation = async (reservationId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    if (!userId) {
      setError("Debes iniciar sesión para cancelar una reserva");
      return;
    }

    try {
      await cancelReservation(reservationId, userId);
      setReservedBooks((prev) => prev.filter((book) => book.id !== reservationId));
      setNotification("Reserva cancelada exitosamente");
    } catch (err) {
      setError(err.message || "Error al cancelar la reserva");
    }
  };

  const handleCancelWaitingList = async (reservationId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    if (!userId) {
      setError("Debes iniciar sesión para cancelar de la lista de espera");
      return;
    }

    try {
      await cancelWaitingList(reservationId, userId);
      setWaitingListBooks((prev) => prev.filter((book) => book.id !== reservationId));
      setNotification("Cancelado de la lista de espera exitosamente");
    } catch (err) {
      setError(err.message || "Error al cancelar de la lista de espera");
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="reserve-books-container">
          <h2>Mis Libros</h2>
          <p>Cargando...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="reserve-books-container">
          <h2>Mis Libros</h2>
          <p className="error-message">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="reserve-books-container">
        <h2>Mis Libros</h2>

        <Notification message={notification} onClose={clearNotification} />

        {/* Sección de Libros Reservados */}
        <h3>Libros Reservados</h3>
        {reservedBooks.length === 0 ? (
          <p>No tienes libros reservados.</p>
        ) : (
          <div className="books-grid">
            {reservedBooks.map((book) => {
              const canCancel = new Date(book.reservedUntil) > new Date();
              return (
                <div key={book.id} className="book-card">
                  <img src={book.thumbnail} alt={book.title} className="book-image" />
                  <h4>{book.title}</h4>
                  <p>{book.authors}</p>
                  <p className="reserved-text">Reservado</p>
                  <p className="reservation-date">
                    Hasta: {new Date(book.reservedUntil).toLocaleDateString()}
                  </p>
                  {canCancel && (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelReservation(book.id)}
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sección de Libros en Lista de Espera */}
        <h3>Libros en Lista de Espera</h3>
        {waitingListBooks.length === 0 ? (
          <p>No estás en la lista de espera de ningún libro.</p>
        ) : (
          <div className="books-grid">
            {waitingListBooks.map((book) => (
              <div key={book.id} className="book-card">
                <img src={book.thumbnail} alt={book.title} className="book-image" />
                <h4>{book.title}</h4>
                <p>{book.authors}</p>
                <p className="waiting-text">En espera</p>
                <p className="waiting-date">
                  En espera desde: {new Date(book.waitingSince).toLocaleDateString()}
                </p>
                <p className="reservation-date">
                  Disponible después de: {new Date(book.reservedUntil).toLocaleDateString()}
                </p>
                <button
                  className="cancel-btn"
                  onClick={() => handleCancelWaitingList(book.id)}
                >
                  Cancelar de Lista de Espera
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ReserveBooks;