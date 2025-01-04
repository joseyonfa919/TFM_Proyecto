import React from 'react'; // Importar React para crear el componente funcional
import Navbar from '../components/Navbar'; // Importar el componente Navbar para la navegación

// Componente funcional que muestra la página de bienvenida
const WelcomePage = () => {
    let user = { name: 'Usuario' }; // Valor predeterminado si no se encuentra el usuario en localStorage

    try {
        // Intentar obtener el nombre del usuario almacenado en localStorage
        const storedUser = localStorage.getItem('name');
        if (storedUser) {
            user = JSON.parse(storedUser); // Si existe, actualizar el objeto user con los datos almacenados
        }
    } catch (error) {
        // Capturar y mostrar errores si ocurre algún problema al obtener el nombre
        console.error('Error al obtener el nombre del usuario:', error);
    }

    return (
        <>
            <Navbar /> {/* Componente de navegación */}
            <div className="welcome-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                {/* Título que da la bienvenida al usuario */}
                <h1>¡Bienvenido, {user.name}!</h1>
                {/* Subtítulo con un mensaje adicional */}
                <p>Estamos encantados de verte en el sistema. Usa las opciones del menú para navegar.</p>
            </div>
        </>
    );
};

export default WelcomePage; // Exportar el componente para usarlo en otras partes del proyecto
