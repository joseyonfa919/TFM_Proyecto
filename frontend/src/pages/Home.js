import React from "react";
import { Link } from "react-router-dom"; // Importar el componente Link para la navegación entre rutas

// Componente funcional que muestra la página de inicio
const Home = () => {
    return (
        <div className="home-container">
            {/* Título principal de la página */}
            <h1>Bienvenido a nuestro sistema</h1>
            {/* Subtítulo que invita al usuario a registrarse o iniciar sesión */}
            <p>Regístrate o inicia sesión para acceder a más funcionalidades.</p>
            {/* Contenedor para los botones de acción */}
            <div className="home-buttons">
                {/* Enlace para redirigir a la página de inicio de sesión */}
                <Link to="/login">
                    <button>Iniciar Sesión</button>
                </Link>
                {/* Enlace para redirigir a la página de registro */}
                <Link to="/register">
                    <button>Registrarse</button>
                </Link>
            </div>
        </div>
    );
};

export default Home; // Exportar el componente para usarlo en otras partes de la aplicación
