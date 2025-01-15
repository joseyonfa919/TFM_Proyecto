import React, { useState } from 'react'; // Importar React y useState para manejar el estado del menú desplegable
import { Link, useNavigate } from 'react-router-dom'; // Importar Link para navegación y useNavigate para redirección
import { FaUserCircle } from 'react-icons/fa'; // Importar ícono de usuario desde react-icons

function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar si el menú desplegable está abierto o cerrado
  const token = localStorage.getItem('token'); // Obtener el token del usuario desde localStorage
  const navigate = useNavigate(); // Hook para redirigir a diferentes rutas

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token del localStorage
    localStorage.removeItem('user_id'); // Eliminar el ID del usuario del localStorage
    localStorage.removeItem('name'); // Eliminar el nombre del usuario del localStorage
    navigate('/'); // Redirigir al usuario a la página de inicio
  };

  // Función para manejar el clic en el botón "Inicio"
  const handleHomeClick = () => {
    if (token) {
      navigate('/WelcomePage'); // Redirigir a la página de bienvenida si el usuario está autenticado
    } else {
      navigate('/'); // Redirigir a la página inicial si el usuario no está autenticado
    }
  };

  // Función para redirigir a la página de cambiar contraseña
  const handleNavigateToChangePassword = () => {
    navigate('/change-password'); // Redirigir a la ruta "/change-password"
  };

  return (
    <nav style={styles.navbar}>
      {/* Botón "Inicio" */}
      <span onClick={handleHomeClick} style={{ ...styles.link, cursor: 'pointer' }}>
        Inicio
      </span>

      {/* Opciones visibles cuando el usuario está autenticado */}
      {token ? (
        <>
          <Link to="/upload" style={styles.link}>Subir Foto</Link>
          <Link to="/Photos" style={styles.link}>Ver Foto</Link>
          <Link to="/create-album" style={styles.link}>Subir Álbum</Link>
          <Link to="/view-albums" style={styles.link}>Ver Álbum</Link>


          {/* Menú desplegable con ícono de perfil */}
          <div style={styles.profileContainer}>
            <FaUserCircle 
              size={30} 
              style={styles.profileIcon} 
              onClick={() => setIsOpen(!isOpen)} // Alternar el estado del menú desplegable
            />
            {/* Menú desplegable cuando isOpen es true */}
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
        // Opciones visibles cuando el usuario no está autenticado
        <>
          <Link to="/login" style={styles.link}>Iniciar Sesión</Link>
          <Link to="/register" style={styles.link}>Registrarse</Link>
        </>
      )}
    </nav>
  );
}

// Estilos en línea para el componente Navbar
const styles = {
  navbar: {
    display: 'flex', // Alinear los elementos en una fila
    justifyContent: 'space-between', // Espaciar los elementos
    alignItems: 'center', // Alinear verticalmente al centro
    backgroundColor: '#333', // Fondo oscuro para la barra de navegación
    padding: '10px 20px', // Espaciado interno
    color: 'white', // Texto blanco
  },
  link: {
    margin: '10px', // Espaciado entre enlaces
    color: 'white', // Color del texto
    textDecoration: 'none', // Eliminar subrayado
    fontSize: '1rem', // Tamaño de fuente
  },
  profileContainer: {
    position: 'relative', // Posición relativa para el menú desplegable
    cursor: 'pointer', // Cambiar cursor al pasar sobre el ícono
  },
  profileIcon: {
    color: 'white', // Color del ícono
  },
  dropdown: {
    position: 'absolute', // Posición flotante
    top: '35px', // Separación vertical
    right: '0', // Alinear al borde derecho
    backgroundColor: '#444', // Fondo del menú desplegable
    color: 'white', // Texto blanco
    borderRadius: '5px', // Bordes redondeados
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', // Sombra para profundidad
    zIndex: 10, // Prioridad en la pila de elementos
  },
  menuList: {
    listStyle: 'none', // Eliminar viñetas
    margin: 0, // Sin margen
    padding: '10px 0', // Espaciado interno
  },
  menuItem: {
    padding: '10px 15px', // Espaciado interno de cada opción
    cursor: 'pointer', // Cambiar cursor al pasar sobre las opciones
    fontSize: '14px', // Tamaño de fuente
    transition: 'background 0.3s', // Transición suave al pasar el cursor
  },
};

export default Navbar; // Exportar el componente Navbar para usarlo en otras partes del proyecto
