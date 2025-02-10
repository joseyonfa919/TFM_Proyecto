import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/Login.css'; // Se carga el archivo de estilos

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            console.log("Enviando datos:", { email, password });
            const response = await axios.post('http://127.0.0.1:5000/login', { email, password });

            if (response.data.token && response.data.user_id && response.data.name) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('name', JSON.stringify({ name: response.data.name }));

                alert('Login exitoso');
                navigate('/WelcomePage');
            } else {
                alert('Credenciales inválidas o datos incompletos del servidor.');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error.response?.data || error.message);
            alert('Error al iniciar sesión');
        }
    };

    return (
        <>
            <Navbar />
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Iniciar Sesión</h2>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                    />
                    <button onClick={handleLogin} className="login-button">
                        Iniciar Sesión
                    </button>
                    <button onClick={() => navigate('/forgot-password')} className="forgot-password">
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
            </div>
        </>
    );
}

export default Login;
