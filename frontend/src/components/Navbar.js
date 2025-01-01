import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // Importar el ícono de usuario

function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Estado para mostrar el menú
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token
    navigate('/'); // Redirigir al inicio
  };

  return (
    <nav style={styles.navbar}>
      {/* Enlace de Inicio */}
      <Link to="/" style={styles.link}>Inicio</Link>

      {/* Opciones cuando el usuario está logueado */}
      {token ? (
        <>
          <Link to="/upload" style={styles.link}>Subir Foto</Link>
          <Link to="/Photos" style={styles.link}>Ver Foto</Link>
          <Link to="/create-album" style={styles.link}>Subir Album</Link>
          <Link to="/view-albums" style={styles.link}>Ver Album</Link>
          
          {/* Icono y Menú desplegable */}
          <div style={styles.profileContainer}>
            <FaUserCircle 
              size={30} 
              style={styles.profileIcon} 
              onClick={() => setIsOpen(!isOpen)} 
            />
            {isOpen && (
              <div style={styles.dropdown}>
                <ul style={styles.menuList}>
                  <li style={styles.menuItem}>Mi Perfil</li>
                  <li style={styles.menuItem}>Configuración</li>
                  <li style={styles.menuItem} onClick={handleLogout}>
                    Cerrar Sesión
                  </li>
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        // Opciones cuando el usuario NO está logueado
        <>
          <Link to="/login" style={styles.link}>Iniciar Sesión</Link>
          <Link to="/register" style={styles.link}>Registrarse</Link>
        </>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: '10px 20px',
    color: 'white',
  },
  link: {
    margin: '10px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
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
    top: '35px',
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
    fontSize: '14px',
    transition: 'background 0.3s',
  },
};

export default Navbar;
