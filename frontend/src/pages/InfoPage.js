import React from 'react'; // Importa React para definir el componente funcional
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para manejar redirecciones
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa Bootstrap para estilos predeterminados
import '../style/InfoPage.css'; // Importa el archivo CSS personalizado para este componente

// =========================== COMPONENTE PRINCIPAL INFOPAGE ===========================

function InfoPage() {
  const navigate = useNavigate(); // Hook para redirigir a otras rutas dentro de la aplicación

  // Función para redirigir a la página de inicio de sesión
  const handleLogin = () => {
    navigate('/login');
  };

  // Función para redirigir a la página de registro
  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="info-page-container"> {/* Contenedor principal de la página */}
      <div className="info-card"> {/* Tarjeta de información */}
        
        {/* Imagen de portada */}
        <img
          src="/imagen/Portada.jpeg"
          alt="Álbum de recuerdos"
          className="info-image"
        />
        
        {/* Título principal */}
        <h1 className="info-title">Revivir</h1>

        {/* Subtítulo con mensaje inspirador */}
        <p className="info-subtitle">
          Evoca la sensación de traer recuerdos a la vida nuevamente.
        </p>

        {/* Contenedor de botones para iniciar sesión o registrarse */}
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

export default InfoPage; // Exporta el componente para su uso en la aplicación
