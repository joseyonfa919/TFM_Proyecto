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
                style={{
                    backgroundImage: `url(${backgroundImage})`,
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
                    textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
                }}
            >
                <motion.h1 
                    className="welcome-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    ¡Bienvenido, {user.name}!
                </motion.h1>
                <p className="welcome-subtitle">Estamos encantados de verte en el sistema. Usa las opciones del menú para navegar.</p>
                
                <div className="quick-actions">
                    <button className="btn-main" onClick={() => navigate('/upload')}>📷 Subir Foto</button>
                    <button className="btn-main" onClick={() => navigate('/create-timeline')}>📁 Crear Cronología</button>
                    <button className="btn-main" onClick={() => navigate('/view-albums')}>📸 Ver Álbum</button>
                    <button className="btn-main" onClick={() => navigate('/multimodal')}>🗣️ Acciones con Voz y Texto</button>
                </div>
            </div>
        </>
    );
};

export default WelcomePage;
