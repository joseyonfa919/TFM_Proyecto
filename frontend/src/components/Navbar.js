import React, { useState } from 'react'; // Importar React y el hook useState para manejar el estado del menú desplegable
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Importar herramientas de navegación
import { FaUserCircle, FaHome } from 'react-icons/fa'; // Importar íconos de usuario y casa
import '../style/Navbar.css'; // Importar los estilos CSS para la barra de navegación

// =========================== COMPONENTE NAVBAR ===========================

function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Estado para manejar si el menú está abierto o cerrado
  const token = localStorage.getItem('token'); // Obtener el token del usuario del almacenamiento local
  const location = useLocation(); // Obtener la ubicación actual en la app
  const navigate = useNavigate(); // Hook para navegar entre rutas

  // =========================== CERRAR SESIÓN ===========================

  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar token de autenticación
    localStorage.removeItem('user_id'); // Eliminar ID del usuario
    localStorage.removeItem('name'); // Eliminar nombre del usuario
    navigate('/'); // Redirigir a la página principal
  };

  // =========================== NAVEGACIÓN A CAMBIO DE CONTRASEÑA ===========================

  const handleNavigateToChangePassword = () => {
    navigate('/change-password'); // Redirigir a la página de cambio de contraseña
  };

  // Verificar si la página actual es una página de autenticación
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password";

  return (
    <nav className="navbar">
      {/* Enlace al inicio dependiendo si el usuario está autenticado o no */}
      <Link to={token ? "/WelcomePage" : "/"} className="nav-item">
        <FaHome className="icon" /> Inicio
      </Link>

      {/* Contenedor de enlaces de navegación */}

      {isAuthPage ? (
        <>
          {/* Mostrar opciones de autenticación si el usuario está en una página de login o registro */}
          <Link to="/login" className="nav-item">🔑 Iniciar Sesión</Link>
          <Link to="/register" className="nav-item">📝 Registrarse</Link>
        </>
      ) : token ? (
        <>
          {/* Mostrar opciones de navegación si el usuario ha iniciado sesión */}
          <Link to="/upload" className="nav-item">📤 Guardar Foto</Link>
          <Link to="/Photos" className="nav-item">🖼️ Mis Fotos</Link>
          <Link to="/create-album" className="nav-item">📁 Crear Álbum</Link>
          <Link to="/view-albums" className="nav-item">📚 Mis Álbumes</Link>
          <Link to="/multimodal" className="nav-item">🗣️ Interacción por Voz</Link>
          <Link to="/create-timeline" className="nav-item">📜 Crear Recuerdo</Link>
          <Link to="/timeline" className="nav-item">📑 Mis Recuerdos</Link>

          {/* Contenedor del perfil del usuario con menú desplegable */}
          <div className="profile-container">
            <FaUserCircle 
              size={30} 
              className="profile-icon" 
              onClick={() => setIsOpen(!isOpen)} // Alternar menú desplegable
            />
            {isOpen && (
              <div className="dropdown">
                <ul className="menu-list">
                  <li className="menu-item" onClick={handleNavigateToChangePassword}>🔑 Cambiar Contraseña</li>
                  <li className="menu-item" onClick={handleLogout}>Cerrar Sesión</li>
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Mostrar opciones de autenticación si el usuario no está autenticado */}
          <Link to="/login" className="link">Iniciar Sesión</Link>
          <Link to="/register" className="link">Registrarse</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
