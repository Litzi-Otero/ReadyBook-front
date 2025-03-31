import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaBook, FaTrash } from "react-icons/fa";
import MainLayout from "../../layouts/MainLayout";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";
import BookCard from "../../components/BookCard/BookCard";
import Notification from "../../components/Notificaciones/Notificatoin";
import { getUsers, editUser, deleteUser, getReservedUserBooks, getWaitingListBooks } from "../../services/authService";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "cliente" });
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [waitingListBooks, setWaitingListBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await getUsers();
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
    setEditingUser(user);
    setNewUser({ username: user.username, email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id) => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBooks = async (user) => {
    setIsLoading(true);
    try {
      const reserved = await getReservedUserBooks(null, { reservedBy: user.id });
      setReservedBooks(reserved || []);
      const waiting = await getWaitingListBooks(user.id);
      setWaitingListBooks(waiting || []);
      setSelectedUser(user);
      setShowBooksModal(true);
    } catch (error) {
      setNotification("Error al cargar los libros: " + (error.message || "Intenta de nuevo."));
    } finally {
      setIsLoading(false);
    }
  };

  const clearNotification = () => setNotification(null);

  const filteredUsers = users.filter(
    (user) =>
      (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderUserRow = (user) => (
    <tr key={user.id}>
      <td>{user.username || "Sin nombre"}</td>
      <td>{user.email || "Sin email"}</td>
      <td>{user.role || "Sin rol"}</td>
      <td>
        <button className="action-btn edit-btn" onClick={() => handleEdit(user)} disabled={isLoading}>
          <FaEdit />
        </button>
        <button className="action-btn view-books-btn" onClick={() => handleViewBooks(user)} disabled={isLoading}>
          <FaBook />
        </button>
        <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(user.id)} disabled={isLoading}>
          <FaTrash />
        </button>
      </td>
    </tr>
  );

  return (
    <MainLayout>
      <div className="manage-users-container">
        <h2>Gestión de Usuarios</h2>
        <Notification message={notification} onClose={clearNotification} />

        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          <FaSearch className="search-icon" />
        </div>

        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <Table
            headers={["Nombre", "Email", "Rol", "Acciones"]}
            data={filteredUsers}
            renderRow={renderUserRow}
            isLoading={isLoading}
          />
        )}

        <Modal
          title="Editar Usuario"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          primaryAction={handleSaveUser}
          primaryLabel="Actualizar"
          secondaryAction={() => setIsModalOpen(false)}
          secondaryLabel="Cancelar"
          isLoading={isLoading}
        >
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
          >
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </Modal>

        <Modal
          title="Confirmar Eliminación"
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          primaryAction={confirmDelete}
          primaryLabel="Eliminar"
          secondaryAction={() => setShowDeleteModal(false)}
          secondaryLabel="Cancelar"
          isLoading={isLoading}
        >
          <p>¿Estás seguro de que quieres eliminar este usuario?</p>
        </Modal>

        <Modal
          title={`Libros de ${selectedUser?.username || "Usuario"}`}
          isOpen={showBooksModal}
          onClose={() => setShowBooksModal(false)}
          secondaryAction={() => setShowBooksModal(false)}
          secondaryLabel="Cerrar"
          isLoading={isLoading}
        >
          <h4>Libros Apartados</h4>
          {reservedBooks.length > 0 ? (
            reservedBooks.map((book) => (
              <BookCard key={book.id} book={book} type="reserved" />
            ))
          ) : (
            <p>No hay libros apartados.</p>
          )}
          <h4>Libros en Lista de Espera</h4>
          {waitingListBooks.length > 0 ? (
            waitingListBooks.map((book) => (
              <BookCard key={book.id} book={book} type="waiting" />
            ))
          ) : (
            <p>No hay libros en la lista de espera.</p>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ManageUsers;