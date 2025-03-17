import React from 'react'; // Importa React para definir el componente funcional
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para manejar redirecciones
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación
import { motion } from 'framer-motion'; // Importa framer-motion para animaciones
import backgroundImage from '../assets/images/camara.png'; // Importa la imagen de fondo
import '../style/WelcomePage.css'; // Importa los estilos CSS específicos para este componente

// =========================== COMPONENTE PRINCIPAL WELCOME PAGE ===========================

const WelcomePage = () => {
    let user = { name: 'Usuario' }; // Definir un usuario por defecto
    const navigate = useNavigate(); // Hook para redirigir a otras rutas dentro de la aplicación

    try {
        const storedUser = localStorage.getItem('name'); // Obtener el nombre del usuario desde localStorage
        if (storedUser) {
            user = JSON.parse(storedUser); // Convertir la cadena JSON a un objeto
        }
    } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
    }

    return (
        <>
            <Navbar /> {/* Renderiza el componente de barra de navegación */}

            <div
                className="welcome-container"
                style={styles.container} // Aplica los estilos de fondo
            >
                {/* Mensaje de bienvenida animado con framer-motion */}
                <motion.h1
                    className="welcome-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    ¡Bienvenido, {user.name}!
                </motion.h1>

                {/* Subtítulo con mensaje motivacional */}
                <p className="welcome-subtitle" style={styles.subtitle}>
                    📷 "Guarda cada instante y deja que la tecnología haga el resto. Aquí, tus recuerdos se convierten en experiencias inolvidables."
                </p>

                {/* Botones de acciones rápidas */}
                <div className="quick-actions" style={styles.buttonContainer}>
                    <motion.button
                        className="btn-main"
                        style={styles.button}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate('/upload')}
                    >
                        📷 Guardar Foto
                    </motion.button>

                    <motion.button
                        className="btn-main"
                        style={styles.button}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate('/create-timeline')}
                    >
                        📁 Crear Recuerdo
                    </motion.button>

                    <motion.button
                        className="btn-main"
                        style={styles.button}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate('/view-albums')}
                    >
                        📸 Mis Álbumes
                    </motion.button>

                    <motion.button
                        className="btn-main"
                        style={styles.button}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate('/multimodal')}
                    >
                        🗣️ Acciones con Voz y Texto
                    </motion.button>
                </div>
            </div>
        </>
    );
};

// =========================== ESTILOS EN LÍNEA PARA EL COMPONENTE ===========================

const styles = {
    container: {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url(${backgroundImage})`, // Fondo con degradado y superposición de imagen
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        color: 'white',
        fontWeight: 'bold',
        textShadow: '2px 2px 10px rgba(0,0,0,0.7)', // Sombra de texto para mejorar visibilidad
    },
    subtitle: {
        fontSize: '18px',
        marginBottom: '20px',
        color: '#f0f0f0',
    },
    buttonContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        transition: '0.3s ease-in-out',
        boxShadow: '0px 4px 6px rgba(0,0,0,0.3)', // Sombra para dar efecto de profundidad
    },
};

export default WelcomePage; // Exporta el componente para su uso en la aplicación
