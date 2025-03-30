import React, { useEffect } from "react";
import MainLayout from "../../layouts/MainLayout"; 
import "./Dashboard.css"; 
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; 
import catalogImage1 from "../../assets/libro.png"; 
import catalogImage2 from "../../assets/libro2.jpg";
import catalogImage3 from "../../assets/libro3.jpg";

const Dashboard = () => {

  const renderArrowPrev = (onClickHandler, hasPrev, label) =>
    hasPrev && (
      <button type="button" onClick={onClickHandler} title={label} className="carousel-arrow carousel-arrow-prev">
        &#9664;
      </button>
    );

  const renderArrowNext = (onClickHandler, hasNext, label) =>
    hasNext && (
      <button type="button" onClick={onClickHandler} title={label} className="carousel-arrow carousel-arrow-next">
        &#9654;
      </button>
    );

  return (
    <MainLayout>
      <div className="dashboard-container">
        <section className="dashboard-content">
          <div className="welcome-section">
            <h2>Bienvenido(a), a ReadyBook!</h2>
            <p>Explora nuestro catálogo, reserva tus libros favoritos y prepárate para disfrutar de grandes lecturas.</p>
            <p>¡Los libros te están esperando!</p>
            <button className="btn-ver-mas">Ver más</button>
          </div>

          <div className="image-section">
            <Carousel
              showThumbs={false}
              autoPlay
              infiniteLoop
              renderArrowPrev={renderArrowPrev}
              renderArrowNext={renderArrowNext}
            >
              <div>
                <img src={catalogImage1} alt="Biblioteca Virtual 1" className="catalog-image" />
              </div>
              <div>
                <img src={catalogImage2} alt="Biblioteca Virtual 2" className="catalog-image" />
              </div>
              <div>
                <img src={catalogImage3} alt="Biblioteca Virtual 3" className="catalog-image" />
              </div>
            </Carousel>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
