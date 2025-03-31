import React, { useState, useEffect } from "react";
import Notification from "../../components/Notificaciones/Notificatoin";
import BookCard from "../../components/BookCard/BookCard";
import Modal from "../../components/Modal/Modal";
import MainLayout from "../../layouts/MainLayout";
import { getReservedBooks, reserveBook, addToWaitingList, getReservedUserBooks, getWaitingListBooks } from "../../services/authService";
import "./ExploreBooks.css";

const ExploreBooks = () => {
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState("programming");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservedStatus, setReservedStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Usado para fetchBooks y handleReserve
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
        status[title] = { reserved: false, reservedBySelf: false };
      }
    }
    setReservedStatus(status);
  };

  const checkReservationLimit = async () => {
    try {
      const reservedBooks = await getReservedUserBooks(null, { reservedBy: userId });
      return reservedBooks.length < MAX_RESERVATIONS;
    } catch (error) {
      return false;
    }
  };

  const checkWaitingListLimit = async () => {
    try {
      const waitingListBooks = await getWaitingListBooks(userId);
      return waitingListBooks.length < MAX_WAITING_LIST;
    } catch (error) {
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
      setNotification("Has alcanzado el límite de 3 libros apartados.");
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

    setIsLoading(true); // Activar estado de carga
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
      setNotification(error.message || "Error al apartar el libro.");
    } finally {
      setIsLoading(false); // Desactivar estado de carga
    }
  };

  const handleAddToWaitingList = async (title) => {
    if (!userId) {
      setNotification("Por favor, inicia sesión para unirte a la lista de espera.");
      return;
    }
    const canAdd = await checkWaitingListLimit();
    if (!canAdd) {
      setNotification("Has alcanzado el límite de 3 libros en la lista de espera.");
      return;
    }
    try {
      await addToWaitingList(title, userId);
      setNotification("Te has añadido a la lista de espera exitosamente.");
    } catch (error) {
      setNotification(error.message || "Error al añadir a la lista de espera.");
    }
  };

  const clearNotification = () => setNotification(null);

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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ingresa el título del libro"
            className="search-input"
            disabled={isLoading} // Deshabilitar mientras se carga
          />
          <label>Filtrar por Categoría: </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading} // Deshabilitar mientras se carga
          >
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
                const status = reservedStatus[book.volumeInfo.title] || { reserved: false, reservedBySelf: false };
                return (
                  <BookCard
                    key={book.id}
                    book={book.volumeInfo}
                    type="explore"
                    status={status}
                    onAction={() => openReserveModal(book)}
                    actionLabel="Apartar"
                    onSecondaryAction={
                      status.reserved
                        ? () => handleAddToWaitingList(book.volumeInfo.title)
                        : () => setSelectedBook(book.volumeInfo)
                    }
                    secondaryActionLabel={status.reserved ? "Agregar a Lista de Espera" : "Ver Detalles"}
                  />
                );
              })
            ) : (
              <p>No se encontraron resultados.</p>
            )}
          </div>
        )}

        <Modal
          title={selectedBook ? selectedBook.title : ""}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
        >
          {selectedBook && (
            <>
              <img
                src={selectedBook.imageLinks?.thumbnail || "https://via.placeholder.com/150"}
                alt={selectedBook.title}
                className="modal-image"
              />
              <p><strong>Autor(es):</strong> {selectedBook.authors ? selectedBook.authors.join(", ") : "Desconocido"}</p>
              <p><strong>Descripción:</strong> {selectedBook.description || "No disponible"}</p>
            </>
          )}
        </Modal>

        <Modal
          title={`Reservar: ${bookToReserve?.volumeInfo.title || ""}`}
          isOpen={showReserveModal}
          onClose={() => setShowReserveModal(false)}
          primaryAction={handleReserve}
          primaryLabel={isLoading ? "Procesando..." : "Confirmar Reserva"} // Cambiar texto según isLoading
          secondaryAction={() => setShowReserveModal(false)}
          secondaryLabel="Cancelar"
          isLoading={isLoading} // Pasar isLoading al Modal para deshabilitar botones
        >
          <label>
            Fecha de entrega:
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="date-input"
              disabled={isLoading} // Deshabilitar input durante la carga
            />
          </label>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ExploreBooks;