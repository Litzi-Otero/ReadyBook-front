import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./MainLayout.css";
import Sidebar from "../components/Sidebar/Sidebar";

const MainLayout = ({ children }) => {
  const [username, setUsername] = useState("");
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false); // Estado para mostrar el mensaje
  const location = useLocation();

  useEffect(() => {
    // Obtener los detalles del usuario desde localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (storedUser && storedUser.username) {
      setUsername(storedUser.username); // Asumimos que el nombre de usuario está en storedUser.username
    } else {
      setUsername("Invitado"); // Si no se encuentra el usuario, mostramos "Invitado"
    }

    // Mostrar el mensaje de bienvenida con un pequeño retraso
    setTimeout(() => {
      setShowWelcomeMessage(true);
    }, 100); // Retraso de 100ms para hacer la animación más visible
  }, []);

  return (
    <div className="main-layout">
      {/* Header fijo */}
      <Sidebar />
      <header className="main-header">
        <Link to="/dashboard">
          <img src={logo} alt="Logo" className="main-logo" />
        </Link>
        <nav className="main-nav">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Inicio</Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>Perfil</Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contacto</Link>
        </nav>
        {/* Mensaje de bienvenida */}
        <div className={`welcome-message ${showWelcomeMessage ? 'show' : ''}`}>
          <span>Bienvenido, {username}!</span>
        </div>
      </header>

      {/* Contenedor de contenido con margen superior para no tapar contenido */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
