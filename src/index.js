import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Asegúrate de importar BrowserRouter
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* Envolvemos App con BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Si deseas comenzar a medir el rendimiento en tu app, pasa una función
// para registrar los resultados (por ejemplo: reportWebVitals(console.log))
// o envíalos a un endpoint de análisis. Aprende más: https://bit.ly/CRA-vitals
reportWebVitals();
