import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
      <div className="home-container">
        <header>
        <h1>Bienvenido a Nuestra Biblioteca Virtual</h1>
        <p>Explora y gestiona tus libros de manera eficiente</p>
        </header>

        <div className="auth-buttons">
          <Link to="/login" className="btn-login">Iniciar Sesión</Link>
          <Link to="/register" className="btn-register">Registrarse</Link>
        </div>
      </div>
  );
};

export default Home;