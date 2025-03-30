import React, { useState, useEffect } from "react";
import Notification from "../../components/Notificaciones/Notificatoin"; // Importamos el componente
import { getReservedBooks, reserveBook, addToWaitingList, getReservedUserBooks, getWaitingListBooks } from "../../services/authService";
import "./ExploreBooks.css";
import MainLayout from "../../layouts/MainLayout";

const ExploreBooks = () => {
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState("programming");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservedStatus, setReservedStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [bookToReserve, setBookToReserve] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notification, setNotification] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userId;
  const userEmail = user.email;
  const MAX_RESERVATIONS = 3;
  const MAX_WAITING_LIST = 3;

  useEffect(() => {
    fetchBooks(searchTerm || category);
  }, [category, searchTerm]);

  const fetchBooks = async (query) => {
    setIsLoading(true);
    try {
      const searchQuery = searchTerm ? `intitle:${searchTerm}` : `subject:${query}`;
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`);
      const data = await response.json();
      const fetchedBooks = data.items || [];
      setBooks(fetchedBooks);
      await checkReservedStatus(fetchedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      setNotification("Error al buscar libros. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkReservedStatus = async (books) => {
    const status = {};
    for (const book of books) {
      const title = book.volumeInfo.title;
      try {
        const reserved = await getReservedBooks(title);
        if (reserved.length > 0) {
          const reservation = reserved[0];
          status[title] = {
            reserved: true,
            reservedBySelf: reservation.reservedBy === userId,
            reservedAt: new Date(reservation.reservedAt).toLocaleDateString(),
            reservedUntil: new Date(reservation.reservedUntil).toLocaleDateString(),
          };
        } else {
          status[title] = { reserved: false, reservedBySelf: false };
        }
      } catch (error) {
        console.error(`Error checking "${title}":`, error.message);
        status[title] = { reserved: false, reservedBySelf: false };
      }
    }
    setReservedStatus(status);
  };

  const setupSSE = () => {
    const eventSource = new EventSource(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/events`);
    window.eventSource = eventSource;

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      if (eventData.event === "newBookReservation") {
        const { title, reservedAt, reservedUntil } = eventData.data;
        setReservedStatus((prev) => ({
          ...prev,
          [title]: {
            reserved: true,
            reservedBySelf: false,
            reservedAt: new Date(reservedAt).toLocaleDateString(),
            reservedUntil: new Date(reservedUntil).toLocaleDateString(),
          },
        }));
      } else if (eventData.event === "reservationCancelled") {
        const { title } = eventData.data;
        setReservedStatus((prev) => ({
          ...prev,
          [title]: { reserved: false, reservedBySelf: false },
        }));
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  };

  const checkReservationLimit = async () => {
    try {
      const reservedBooks = await getReservedUserBooks(null, { reservedBy: userId });
      return reservedBooks.length < MAX_RESERVATIONS;
    } catch (error) {
      console.error("Error checking reservation limit:", error);
      return false;
    }
  };

  const checkWaitingListLimit = async () => {
    try {
      const waitingListBooks = await getWaitingListBooks(userId);
      return waitingListBooks.length < MAX_WAITING_LIST;
    } catch (error) {
      console.error("Error checking waiting list limit:", error);
      return false;
    }
  };

  const openReserveModal = async (book) => {
    if (!userId) {
      setNotification("Por favor, inicia sesión para apartar un libro.");
      return;
    }

    const canReserve = await checkReservationLimit();
    if (!canReserve) {
      setNotification("Has alcanzado el límite de 3 libros apartados. Cancela una reserva para apartar otro.");
      return;
    }

    setBookToReserve(book);
    setDeliveryDate("");
    setShowReserveModal(true);
  };

  const handleReserve = async () => {
    if (!deliveryDate) {
      setNotification("Por favor, selecciona una fecha de entrega.");
      return;
    }

    const startDate = new Date();
    const endDate = new Date(deliveryDate);

    if (endDate <= startDate) {
      setNotification("La fecha de entrega debe ser posterior a hoy.");
      return;
    }

    const bookData = {
      bookId: bookToReserve.id,
      title: bookToReserve.volumeInfo.title,
      authors: bookToReserve.volumeInfo.authors || [],
      thumbnail: bookToReserve.volumeInfo.imageLinks?.thumbnail || "",
      description: bookToReserve.volumeInfo.description || "",
      reservedBy: userId,
      reservedAt: startDate.toISOString(),
      reservedUntil: endDate.toISOString(),
      email: userEmail,
    };

    try {
      await reserveBook(bookData);
      setShowReserveModal(false);
      setBookToReserve(null);
      setReservedStatus((prev) => ({
        ...prev,
        [bookData.title]: {
          reserved: true,
          reservedBySelf: true,
          reservedAt: new Date(bookData.reservedAt).toLocaleDateString(),
          reservedUntil: new Date(bookData.reservedUntil).toLocaleDateString(),
        },
      }));
      setNotification("Libro apartado exitosamente");
    } catch (error) {
      console.error("Error en handleReserve:", error);
      setNotification(error.message || "Error al apartar el libro.");
    }
  };

  const handleAddToWaitingList = async (title) => {
    if (!userId) {
      setNotification("Por favor, inicia sesión para unirte a la lista de espera.");
      return;
    }

    const canAddToWaitingList = await checkWaitingListLimit();
    if (!canAddToWaitingList) {
      setNotification("Has alcanzado el límite de 3 libros en la lista de espera. Retira uno para añadir otro.");
      return;
    }

    try {
      await addToWaitingList(title, userId);
      setNotification("Te has añadido a la lista de espera exitosamente.");
    } catch (error) {
      setNotification(error.message || "Error al añadir a la lista de espera.");
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <MainLayout>
      <div className="explore-books-container">
        <h2>Explorar Libros</h2>

        <Notification message={notification} onClose={clearNotification} />

        <div className="filter-container">
          <label>Buscar por Título: </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Ingresa el título del libro"
            className="search-input"
          />
          <label>Filtrar por Categoría: </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="programming">Programación</option>
            <option value="fiction">Ficción</option>
            <option value="science">Ciencia</option>
            <option value="history">Historia</option>
            <option value="self-help">Autoayuda</option>
            <option value="business">Negocios</option>
          </select>
        </div>

        {isLoading ? (
          <p>Cargando libros...</p>
        ) : (
          <div className="books-grid">
            {books.length > 0 ? (
              books.map((book) => {
                const volumeInfo = book.volumeInfo;
                const status = reservedStatus[volumeInfo.title] || { reserved: false, reservedBySelf: false };
                return (
                  <div key={book.id} className="book-card">
                    <img
                      src={volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150"}
                      alt={volumeInfo.title}
                      className="book-image"
                    />
                    <h3>{volumeInfo.title}</h3>
                    <p>{volumeInfo.authors ? volumeInfo.authors.join(", ") : "Autor desconocido"}</p>
                    {status.reserved ? (
                      status.reservedBySelf ? (
                        <div className="reservation-info">
                          <p className="reserved-text">Apartado por ti</p>
                          <p>Desde: {status.reservedAt}</p>
                          <p>Hasta: {status.reservedUntil}</p>
                        </div>
                      ) : (
                        <div className="reservation-info">
                          <p className="reserved-text">Apartado</p>
                          <p>Hasta: {status.reservedUntil}</p>
                          <button
                            className="waiting-list-btn"
                            onClick={() => handleAddToWaitingList(volumeInfo.title)}
                          >
                            Agregar a Lista de Espera
                          </button>
                        </div>
                      )
                    ) : (
                      <button className="reserve-btn" onClick={() => openReserveModal(book)}>
                        Apartar
                      </button>
                    )}
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedBook(volumeInfo)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                );
              })
            ) : (
              <p>No se encontraron resultados.</p>
            )}
          </div>
        )}

        {selectedBook && (
          <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedBook(null)}>×</button>
              <img
                src={selectedBook.imageLinks?.thumbnail || "https://via.placeholder.com/150"}
                alt={selectedBook.title}
                className="modal-image"
              />
              <h2>{selectedBook.title}</h2>
              <p>
                <strong>Autor(es):</strong>{" "}
                {selectedBook.authors ? selectedBook.authors.join(", ") : "Desconocido"}
              </p>
              <p>
                <strong>Descripción:</strong>{" "}
                {selectedBook.description || "No disponible"}
              </p>
            </div>
          </div>
        )}

        {showReserveModal && (
          <div className="modal-overlay" onClick={() => setShowReserveModal(false)}>
            <div className="modal-content reserve-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowReserveModal(false)}>×</button>
              <h3>Reservar: {bookToReserve?.volumeInfo.title}</h3>
              <label>
                Fecha de entrega:
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </label>
              <button className="confirm-reserve-btn" onClick={handleReserve}>
                Confirmar Reserva
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExploreBooks;