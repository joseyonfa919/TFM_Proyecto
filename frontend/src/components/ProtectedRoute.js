import React from "react"; // Importar React para definir el componente funcional
import { Navigate } from "react-router-dom"; // Importar Navigate para redirigir a otras rutas

// Componente funcional que protege rutas basadas en la autenticación del usuario
const ProtectedRoute = ({ children }) => {
    // Obtener los datos del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Si el usuario está autenticado (existe en localStorage), renderiza los componentes hijos
    // De lo contrario, redirige al usuario a la página de inicio de sesión
    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute; // Exportar el componente para usarlo en la configuración de rutas protegidas
