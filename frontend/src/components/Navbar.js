import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaHome, FaUpload, FaPhotoVideo, FaBook, FaMicrophone } from 'react-icons/fa';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('name');
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate(token ? '/WelcomePage' : '/');
  };

  const handleNavigateToChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <>
      <nav style={styles.navbar}>
        <span onClick={handleHomeClick} style={styles.navItem}>
          <FaHome style={styles.icon} /> Inicio
        </span>
        {token ? (
          <>
            <Link to="/upload" style={styles.navItem}><FaUpload style={styles.icon} /> Guardar Foto</Link>
            <Link to="/Photos" style={styles.navItem}><FaPhotoVideo style={styles.icon} /> Mis Fotos</Link>
            <Link to="/create-album" style={styles.navItem}><FaBook style={styles.icon} /> Crear Álbum</Link>
            <Link to="/view-albums" style={styles.navItem}><FaBook style={styles.icon} /> Mis Álbumes</Link>
            <Link to="/multimodal" style={styles.navItem}><FaMicrophone style={styles.icon} /> Interacción por Voz</Link>
            <Link to="/create-timeline" style={styles.navItem}><FaBook style={styles.icon} /> Crear Recuerdo</Link>
            <Link to="/timeline" style={styles.navItem}><FaBook style={styles.icon} /> Mis Recuerdos</Link>
            
            <div style={styles.profileContainer}>
              <FaUserCircle size={35} style={styles.profileIcon} onClick={() => setIsOpen(!isOpen)} />
              {isOpen && (
                <div style={styles.dropdown}>
                  <ul style={styles.menuList}>
                    <li style={styles.menuItem}>Mi Perfil</li>
                    <li style={styles.menuItem}>Configuración</li>
                    <li style={styles.menuItem} onClick={handleNavigateToChangePassword}>Cambiar Contraseña</li>
                    <li style={styles.menuItem} onClick={handleLogout}>Cerrar Sesión</li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.navItem}>Iniciar Sesión</Link>
            <Link to="/register" style={styles.navItem}>Registrarse</Link>
          </>
        )}
      </nav>
      <div style={styles.contentPadding}></div>
    </>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: '15px 20px',
    color: 'white',
    fontSize: '18px',
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: 1000,
    height: '60px',
  },
  contentPadding: {
    marginTop: '80px', // Espacio para que el contenido no quede detrás de la barra
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '5px',
    transition: 'background 0.3s',
  },
  icon: {
    fontSize: '20px',
  },
  profileContainer: {
    position: 'relative',
    cursor: 'pointer',
  },
  profileIcon: {
    color: 'white',
  },
  dropdown: {
    position: 'absolute',
    top: '45px',
    right: '0',
    backgroundColor: '#444',
    color: 'white',
    borderRadius: '5px',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  menuList: {
    listStyle: 'none',
    margin: 0,
    padding: '10px 0',
  },
  menuItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background 0.3s',
  },
};

export default Navbar;
