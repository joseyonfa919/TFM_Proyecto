import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaHome } from 'react-icons/fa';
import '../style/Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('name');
    navigate('/');
  };

 

  const handleNavigateToChangePassword = () => {
    navigate('/change-password');
  };
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register"|| location.pathname === "/forgot-password";

  return (
    <nav className="navbar">
      <Link to={token ? "/WelcomePage" : "/"} className="nav-item">
            <FaHome className="icon" /> Inicio
          </Link>

          {/* Contenedor de enlaces de navegación */}

          {isAuthPage ? (
            <>
              <Link to="/login" className="nav-item">🔑 Iniciar Sesión</Link>
              <Link to="/register" className="nav-item">📝 Registrarse</Link>
            </>
          ) : token ? (
        <>
            <Link to="/upload" className="nav-item">📤 Guardar Foto</Link>
              <Link to="/Photos" className="nav-item">🖼️ Mis Fotos</Link>
              <Link to="/create-album" className="nav-item">📁 Crear Álbum</Link>
              <Link to="/view-albums" className="nav-item">📚 Mis Álbumes</Link>
              <Link to="/multimodal" className="nav-item">🗣️ Interacción por Voz</Link>
              <Link to="/create-timeline" className="nav-item">📜 Crear Recuerdo</Link>
              <Link to="/timeline" className="nav-item">📑 Mis Recuerdos</Link>

          <div className="profile-container">
            <FaUserCircle 
              size={30} 
              className="profile-icon" 
              onClick={() => setIsOpen(!isOpen)}
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
          <Link to="/login" className="link">Iniciar Sesión</Link>
          <Link to="/register" className="link">Registrarse</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
