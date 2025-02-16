import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            const response = await axios.post('http://127.0.0.1:5000/forgot-password', { email });
            setMessage(response.data.message);
            setEmail(''); // 🔹 Esto limpiará la caja de texto después de enviar el formulario
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Error al enviar la solicitud.');
        }
    
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div className="forgot-password-container">
                <div className="forgot-password-card">
                    <h2 className="forgot-password-title">Recuperación de Contraseña</h2>
                    <p className="forgot-password-text">
                        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    <form onSubmit={handleForgotPassword}>
                        <input
                            type="email"
                            placeholder="Ingresa tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="forgot-password-input"
                            required
                        />
                        <button type="submit" className="forgot-password-button" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                    </form>
                    {message && <p className="forgot-password-message">{message}</p>}
                    <button onClick={() => navigate('/login')} className="back-to-login">
                        Volver a Iniciar Sesión
                    </button>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
