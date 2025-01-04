import React from 'react';
import { useNavigate } from 'react-router-dom'; // Hook para navegar entre rutas
import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos de Bootstrap para diseño moderno

// Componente funcional que muestra la página de información del sistema
function InfoPage() {
  const navigate = useNavigate(); // Hook para redirigir a diferentes rutas

  // Función para manejar la navegación a la página de inicio de sesión
  const handleLogin = () => {
    navigate('/login'); // Redirige a la ruta "/login"
  };

  // Función para manejar la navegación a la página de registro
  const handleRegister = () => {
    navigate('/register'); // Redirige a la ruta "/register"
  };

  return (
    <div className="container-fluid bg-light vh-100 d-flex flex-column justify-content-center align-items-center">
      {/* Contenedor principal con estilos de Bootstrap para centrado y fondo */}
      <div className="text-center">
        {/* Línea de la imagen */}
        <img
          src="/imagen/Portada.jpeg" // Ruta de la imagen que se muestra
          alt="Logo del Sistema" // Texto alternativo para accesibilidad
          className="mb-4" // Clase de Bootstrap para margen inferior
          style={{ width: "500px", height: "auto" }} // Estilo en línea para tamaño de la imagen
        />
        {/* Título principal de la página */}
        <h1 className="display-4 fw-bold text-primary mb-4">Revivir</h1>
        {/* Subtítulo con información adicional */}
        <p className="lead text-muted mb-4">
          Evoca la sensación de traer recuerdos a la vida nuevamente.
        </p>
        {/* Botones para iniciar sesión o registrarse */}
        <div>
          <button
            className="btn btn-primary btn-lg me-3" // Estilo de Bootstrap para botón grande y margen derecho
            onClick={handleLogin} // Llama a handleLogin al hacer clic
          >
            Iniciar Sesión
          </button>
          <button
            className="btn btn-outline-primary btn-lg" // Botón con estilo de contorno
            onClick={handleRegister} // Llama a handleRegister al hacer clic
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoPage; // Exporta el componente para su uso en otras partes del proyecto
