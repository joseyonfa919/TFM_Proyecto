import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';



function InfoPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="container-fluid bg-light vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="text-center">s
        {/* Línea de la imagen */}
        <img
          src="/imagen/Portada.jpeg" 
          alt="Logo del Sistema"
          className="mb-4"
          style={{ width: "500px", height: "auto" }} 
        />
        <h1 className="display-4 fw-bold text-primary mb-4">Revivir</h1>
        <p className="lead text-muted mb-4">
            Evoca la sensación de traer recuerdos a la vida nuevamente.
        </p>
        <div>
          <button
            className="btn btn-primary btn-lg me-3"
            onClick={handleLogin}
          >
            Iniciar Sesión
          </button>
          <button
            className="btn btn-outline-primary btn-lg"
            onClick={handleRegister}
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
