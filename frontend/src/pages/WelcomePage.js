import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import backgroundImage from '../assets/images/camara.png';
import '../style/WelcomePage.css';

const WelcomePage = () => {
    let user = { name: 'Usuario' };
    const navigate = useNavigate();

    try {
        const storedUser = localStorage.getItem('name');
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
    }

    return (
        <>
            <Navbar />
            <div 
                className="welcome-container"
                style={styles.container}
            >
                <motion.h1 
                    className="welcome-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    ¡Bienvenido, {user.name}!
                </motion.h1>
                <p className="welcome-subtitle" style={styles.subtitle}>📷 "Guarda cada instante y deja que la tecnología haga el resto. Aquí, tus recuerdos se convierten en experiencias inolvidables."</p>
                
                <div className="quick-actions" style={styles.buttonContainer}>
                    <motion.button className="btn-main" style={styles.button} whileHover={{ scale: 1.1 }} onClick={() => navigate('/upload')}>📷 Guardar Foto</motion.button>
                    <motion.button className="btn-main" style={styles.button} whileHover={{ scale: 1.1 }} onClick={() => navigate('/create-timeline')}>📁 Crear Recuerdo</motion.button>
                    <motion.button className="btn-main" style={styles.button} whileHover={{ scale: 1.1 }} onClick={() => navigate('/view-albums')}>📸 Mis Álbumes</motion.button>
                    <motion.button className="btn-main" style={styles.button} whileHover={{ scale: 1.1 }} onClick={() => navigate('/multimodal')}>🗣️ Acciones con Voz y Texto</motion.button>
                </div>
            </div>
        </>
    );
};

const styles = {
    container: {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url(${backgroundImage})`,
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
        textShadow: '2px 2px 10px rgba(0,0,0,0.7)',
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
        boxShadow: '0px 4px 6px rgba(0,0,0,0.3)',
    },
};

export default WelcomePage;
