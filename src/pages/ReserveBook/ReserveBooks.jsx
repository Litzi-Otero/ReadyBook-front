import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Notification from "../../components/Notificaciones/Notificatoin";
import BookCard from "../../components/BookCard/BookCard";
import MainLayout from "../../layouts/MainLayout";
import { getReservedUserBooks, getWaitingListBooks, cancelReservation, cancelWaitingList } from "../../services/authService";
import "./ReserveBooks.css";

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

        if (!userId) throw new Error("Debes iniciar sesión para ver tus libros");

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

  const clearNotification = () => setNotification(null);

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

        <h3>Libros Reservados</h3>
        {reservedBooks.length === 0 ? (
          <p>No tienes libros reservados.</p>
        ) : (
          <div className="books-grid">
            {reservedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                type="reserved"
                onAction={() => handleCancelReservation(book.id)}
                actionLabel="Cancelar Reserva"
              />
            ))}
          </div>
        )}

        <h3>Libros en Lista de Espera</h3>
        {waitingListBooks.length === 0 ? (
          <p>No estás en la lista de espera de ningún libro.</p>
        ) : (
          <div className="books-grid">
            {waitingListBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                type="waiting"
                onAction={() => handleCancelWaitingList(book.id)}
                actionLabel="Cancelar de Lista de Espera"
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ReserveBooks;