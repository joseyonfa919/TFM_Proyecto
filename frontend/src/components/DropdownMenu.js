import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa"; // Ícono de usuario
import { useNavigate } from "react-router-dom";

function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar el token del localStorage
    navigate("/login"); // Redirigir al login
  };

  return (
    <div style={styles.container}>
      {/* Botón del perfil */}
      <div onClick={() => setIsOpen(!isOpen)} style={styles.profileButton}>
        <FaUserCircle size={32} style={{ cursor: "pointer" }} />
      </div>

      {/* Menú desplegable */}
      {isOpen && (
        <div style={styles.dropdown}>
          <ul style={styles.menuList}>
            <li style={styles.menuItem}>Mis GPT</li>
            <li style={styles.menuItem}>Personalizar ChatGPT</li>
            <li style={styles.menuItem}>Configuración</li>
            <li style={styles.menuItem}>Mejorar el plan</li>
            <li style={styles.menuItem}>Obtener la extensión</li>
            <li style={styles.menuItem} onClick={handleLogout}>
              Cerrar sesión
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    display: "inline-block",
  },
  profileButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "40px",
    right: "0",
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    width: "200px",
    zIndex: 10,
  },
  menuList: {
    listStyleType: "none",
    padding: "10px 0",
    margin: 0,
  },
  menuItem: {
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default DropdownMenu;
