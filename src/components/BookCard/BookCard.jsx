// src/components/BookCard.jsx
import React from "react";
import "./BookCard.css";

const BookCard = ({
  book,
  type = "explore", // "explore", "reserved", "waiting"
  status = { reserved: false, reservedBySelf: false },
  onAction,
  onSecondaryAction,
  actionLabel,
  secondaryActionLabel,
  isSecondaryActionLoading = false, // Nueva prop para estado de carga
}) => {
  const isExplore = type === "explore";
  const isReserved = type === "reserved";
  const isWaiting = type === "waiting";

  return (
    <div className={`book-card ${isWaiting ? "waiting-list-card" : ""}`}>
      {isExplore && book.imageLinks?.thumbnail && (
        <img
          src={book.imageLinks.thumbnail}
          alt={book.title}
          className="book-image"
        />
      )}
      <h4>{book.title || "Sin título"}</h4>
      <p>{book.authors ? (Array.isArray(book.authors) ? book.authors.join(", ") : book.authors) : "Autor desconocido"}</p>
      {isExplore && status.reserved ? (
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
            {onSecondaryAction && secondaryActionLabel && (
              <button
                className="waiting-list-btn"
                onClick={onSecondaryAction}
                disabled={isSecondaryActionLoading} // Deshabilitar mientras procesa
              >
                {isSecondaryActionLoading ? "Procesando..." : secondaryActionLabel}
              </button>
            )}
          </div>
        )
      ) : isReserved ? (
        <>
          <p className="reserved-text">Reservado</p>
          <p className="reservation-date">
            Hasta: {new Date(book.reservedUntil).toLocaleDateString()}
          </p>
        </>
      ) : isWaiting ? (
        <>
          <p className="waiting-text">En espera</p>
          <p className="waiting-date">
            Desde: {new Date(book.waitingSince).toLocaleDateString()}
          </p>
          <p className="reservation-date">
            Disponible después: {new Date(book.reservedUntil).toLocaleDateString()}
          </p>
        </>
      ) : null}
      {onAction && actionLabel && (
        <button
          className={isExplore ? "reserve-btn" : "cancel-btn"}
          onClick={onAction}
          disabled={isReserved && new Date(book.reservedUntil) <= new Date()}
        >
          {actionLabel}
        </button>
      )}
      {isExplore && onSecondaryAction && secondaryActionLabel && !status.reserved && (
        <button className="view-details-btn" onClick={onSecondaryAction}>
          {secondaryActionLabel}
        </button>
      )}
    </div>
  );
};

export default BookCard;
