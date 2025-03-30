import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaTimes, FaBook } from "react-icons/fa";
import MainLayout from "../../layouts/MainLayout";
import { getUsers, editUser, deleteUser, getReservedUserBooks, getWaitingListBooks } from "../../services/authService";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "cliente" });
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [waitingListBooks, setWaitingListBooks] = useState([]); // Nuevo estado para lista de espera
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await getUsers();
      console.log("Usuarios recibidos:", usersData);
      setUsers(usersData || []);
    } catch (error) {
      setNotification("Error al cargar los usuarios: " + (error.message || "Intenta de nuevo."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.role) {
      setNotification("Por favor, completa todos los campos.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setNotification("Por favor, ingresa un email válido.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Actualizando usuario con ID:", editingUser.id, "Datos:", newUser);
      await editUser(editingUser.id, newUser);
      setNotification("Usuario actualizado exitosamente.");
      setIsModalOpen(false);
      setNewUser({ username: "", email: "", role: "cliente" });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setNotification("Error al guardar el usuario: " + (error.message || "Intenta de nuevo."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    console.log("Usuario a editar:", user);
    setEditingUser(user);
    setNewUser({ username: user.username, email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setNewUser({ username: "", email: "", role: "cliente" });
    setEditingUser(null);
  };

  const handleDeleteRequest = (id) => {
    console.log("User ID to delete:", id);
    if (!id) {
      setNotification("ID de usuario no válido.");
      return;
    }
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteUser(userToDelete);
      setNotification("Usuario eliminado exitosamente.");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      setNotification("Error al eliminar el usuario: " + (error.message || "Intenta de nuevo."));
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleViewBooks = async (user) => {
    setIsLoading(true);
    try {
      // Obtener libros apartados
      const reserved = await getReservedUserBooks(null, { reservedBy: user.id });
      console.log("Libros apartados recibidos para", user.username, ":", reserved);
      setReservedBooks(reserved || []);

      // Obtener libros en lista de espera
      const waiting = await getWaitingListBooks(user.id);
      console.log("Libros en lista de espera recibidos para", user.username, ":", waiting);
      setWaitingListBooks(waiting || []);

      setSelectedUser(user);
      setShowBooksModal(true);
    } catch (error) {
      setNotification("Error al cargar los libros: " + (error.message || "Intenta de nuevo."));
    } finally {
      setIsLoading(false);
    }
  };

  const closeBooksModal = () => {
    setShowBooksModal(false);
    setReservedBooks([]);
    setWaitingListBooks([]);
    setSelectedUser(null);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="manage-users-container">
        <h2>Gestión de Usuarios</h2>

        {notification && (
          <div className="notification">
            <p>{notification}</p>
            <button className="close-notification-btn" onClick={clearNotification}>
              ×
            </button>
          </div>
        )}

        <div className="search-containerM">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          <FaSearch className="search-iconM" />
        </div>

        {isLoading && <p>Cargando...</p>}

        {!isLoading && (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username || "Sin nombre"}</td>
                      <td>{user.email || "Sin email"}</td>
                      <td>{user.role || "Sin rol"}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(user)} disabled={isLoading}>
                          <FaEdit />
                        </button>
                        <button
                          className="view-books-btn"
                          onClick={() => handleViewBooks(user)}
                          disabled={isLoading}
                        >
                          <FaBook />
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteRequest(user.id)} disabled={isLoading}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Editar Usuario</h3>
                <button className="close-btn" onClick={handleCancelEdit} disabled={isLoading}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  disabled={isLoading}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  disabled={isLoading}
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  disabled={isLoading}
                  className="role-select"
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={handleCancelEdit} disabled={isLoading}>
                  Cancelar
                </button>
                <button className="save-btn" onClick={handleSaveUser} disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Actualizar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Confirmar Eliminación</h3>
                <button className="close-btn" onClick={cancelDelete} disabled={isLoading}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres eliminar este usuario?</p>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={cancelDelete} disabled={isLoading}>
                  Cancelar
                </button>
                <button className="delete-confirm-btn" onClick={confirmDelete} disabled={isLoading}>
                  {isLoading ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showBooksModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Libros de {selectedUser?.username || "Usuario"}</h3>
                <button className="close-btn" onClick={closeBooksModal} disabled={isLoading}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <h4>Libros Apartados</h4>
                {reservedBooks.length > 0 ? (
                  <div className="reserved-books-cards">
                    {reservedBooks.map((book) => (
                      <div key={book.id} className="book-card">
                        <h4>{book.title || "Sin título"}</h4>
                        <p>{book.authors || "Autor desconocido"}</p>
                        <p className="book-dates">
                          Reservado: {new Date(book.reservedAt).toLocaleDateString()} - Hasta:{" "}
                          {new Date(book.reservedUntil).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay libros apartados.</p>
                )}

                <h4>Libros en Lista de Espera</h4>
                {waitingListBooks.length > 0 ? (
                  <div className="reserved-books-cards">
                    {waitingListBooks.map((book) => (
                      <div key={book.id} className="book-card waiting-list-card">
                        <h4>{book.title || "Sin título"}</h4>
                        <p>{book.authors || "Autor desconocido"}</p>
                        <p className="book-dates">
                          En espera desde: {new Date(book.waitingSince).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay libros en la lista de espera.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeBooksModal} disabled={isLoading}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManageUsers;