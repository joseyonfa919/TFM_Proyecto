import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/login', { email, password });
            console.log('Respuesta del servidor:', response.data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token); // Guarda el token
                alert('Login exitoso');
                navigate('/'); // Redirige a la página de fotos
            } else {
                alert('No se recibió un token válido');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Error al iniciar sesión');
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Iniciar Sesión</h2>
                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                <input
                    type="password"
                    placeholder="Contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                <button onClick={handleLogin} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    Iniciar Sesión
                </button>
            </div>
        </>
    );
}

export default Login;
