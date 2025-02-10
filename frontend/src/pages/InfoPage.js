import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/InfoPage.css'; // Archivo CSS para estilos personalizados

function InfoPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="info-page-container">
      <div className="info-card">
        <img
          src="/imagen/Portada.jpeg"
          alt="Álbum de recuerdos"
          className="info-image"
        />
        <h1 className="info-title">Revivir</h1>
        <p className="info-subtitle">
          Evoca la sensación de traer recuerdos a la vida nuevamente.
        </p>
        <div className="button-container">
          <button className="btn btn-primary btn-lg" onClick={handleLogin}>
            Iniciar Sesión
          </button>
          <button className="btn btn-outline-primary btn-lg" onClick={handleRegister}>
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
