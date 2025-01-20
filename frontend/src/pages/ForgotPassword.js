import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Componente de navegación  

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/forgot-password', { email });
            setMessage(response.data.message);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Error al enviar la solicitud.');
        }
    };

    return (
        <div><Navbar /> {/* Renderiza el componente de barra de navegación. */}
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Recuperación de Contraseña</h2>
            <form onSubmit={handleForgotPassword}>
                <input
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                <button type="submit" style={{ padding: '8px 16px' }}>
                    Enviar
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
        </div>
    );
}

export default ForgotPassword;
  