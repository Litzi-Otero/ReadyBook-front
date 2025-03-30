import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBook, FaBookmark, FaUser, FaBell, FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../../services/authService"; // Importamos la función de logout
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el rol del usuario desde localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.role) {
      setUserRole(storedUser.role);
    }
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user"); 
    navigate("/login");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>
      <ul>
        <li>
          <Link to="/explore" className={location.pathname === "/explore" ? "active" : ""}>
            <FaBook className="icon" /> {isOpen && "Explorar libros"}
          </Link>
        </li>
        <li>
          <Link to="/reserve" className={location.pathname === "/reserve" ? "active" : ""}>
            <FaBookmark className="icon" /> {isOpen && "Mis libros"}
          </Link>
        </li>
        {userRole === "admin" && (
          <li>
            <Link to="/usuarios" className={location.pathname === "/usuarios" ? "active" : ""}>
              <FaUser className="icon" /> {isOpen && "Gestión de usuarios"}
            </Link>
          </li>
        )}
        <li>
          <Link to="/notificaciones" className={location.pathname === "/notificaciones" ? "active" : ""}>
            <FaBell className="icon" /> {isOpen && "Notificaciones"}
          </Link>
        </li>
      </ul>

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="icon red-icon" /> {isOpen && "Cerrar sesión"}
      </button>
    </div>
  );
};

export default Sidebar;
