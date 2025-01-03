import React from 'react';
import Navbar from '../components/Navbar';

const WelcomePage = () => {
    let user = { name: 'Usuario' }; // Valor por defecto

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
            <div className="welcome-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1>¡Bienvenido, {user.name}!</h1>
                <p>Estamos encantados de verte en el sistema. Usa las opciones del menú para navegar.</p>
            </div>
        </>
    );
};

export default WelcomePage;
