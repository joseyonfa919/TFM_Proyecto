import React, { useState } from "react"; // Importar React y el hook useState para manejar estados locales
import { FaUserCircle } from "react-icons/fa"; // Importar ícono de usuario desde react-icons
import { useNavigate } from "react-router-dom"; // Hook para redirigir entre rutas

// Componente funcional para el menú desplegable del usuario
function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false); // Estado para manejar si el menú está abierto o cerrado
  const navigate = useNavigate(); // Hook para redirigir a otras rutas

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar el token del usuario de localStorage
    navigate("/login"); // Redirigir al usuario a la página de inicio de sesión
  };

  return (
    <div style={styles.container}>
      {/* Ícono del perfil que activa el menú desplegable */}
      <div onClick={() => setIsOpen(!isOpen)} style={styles.profileButton}>
        <FaUserCircle size={32} style={{ cursor: "pointer" }} /> {/* Ícono de usuario */}
      </div>

      {/* Contenedor del menú desplegable */}
      {isOpen && (
        <div style={styles.dropdown}>
          <ul style={styles.menuList}>
            {/* Opciones del menú */}
            <li style={styles.menuItem}>Mis GPT</li>
            <li style={styles.menuItem}>Personalizar ChatGPT</li>
            <li style={styles.menuItem}>Configuración</li>
            <li style={styles.menuItem}>Mejorar el plan</li>
            <li style={styles.menuItem}>Obtener la extensión</li>
            {/* Opción para cerrar sesión */}
            <li style={styles.menuItem} onClick={handleLogout}>
              Cerrar sesión
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Estilos del componente
const styles = {
  container: {
    position: "relative", // Posición relativa para que el menú se ubique correctamente
    display: "inline-block", // Mantener el botón de perfil en línea
  },
  profileButton: {
    display: "flex", // Centrar contenido dentro del botón
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer", // Cambiar el cursor al pasar sobre el botón
  },
  dropdown: {
    position: "absolute", // Menú flotante
    top: "40px", // Separación del botón de perfil
    right: "0", // Alinear el menú a la derecha del contenedor
    backgroundColor: "#333", // Fondo oscuro para el menú
    color: "#fff", // Texto blanco
    borderRadius: "8px", // Bordes redondeados
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)", // Sombra para darle profundidad
    width: "200px", // Ancho fijo del menú
    zIndex: 10, // Asegurar que el menú esté sobre otros elementos
  },
  menuList: {
    listStyleType: "none", // Eliminar viñetas de la lista
    padding: "10px 0", // Espaciado interno
    margin: 0, // Sin márgenes
  },
  menuItem: {
    padding: "10px 15px", // Espaciado interno para cada elemento
    cursor: "pointer", // Cambiar el cursor al pasar sobre el elemento
    fontSize: "14px", // Tamaño de fuente para las opciones del menú
  },
};

export default DropdownMenu; // Exportar el componente para usarlo en otras partes del proyecto
