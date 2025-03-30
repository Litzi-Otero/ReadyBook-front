import React from "react";
import "./Footer.css"; // Estilos opcionales

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Nuestra Plataforma. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;
