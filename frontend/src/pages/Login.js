import React, { useState } from 'react'; // Importa React y useState para gestionar estados locales.
import axios from 'axios'; // Importa axios para realizar solicitudes HTTP.
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redirigir al usuario.
import Navbar from '../components/Navbar'; // Importa el componente Navbar.

function Login() {
    // Estados locales para almacenar el email y la contraseña introducidos por el usuario.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Hook para manejar la navegación en la aplicación.

    // Función manejadora del inicio de sesión.
    const handleLogin = async (e) => {
        e.preventDefault(); // Evita que el formulario recargue la página al enviarse.
        try {
            console.log("Enviando datos:", { email, password }); // Log para depuración.
            // Realiza una solicitud POST al backend con el email y la contraseña.
            const response = await axios.post('http://127.0.0.1:5000/login', { email, password });
            console.log("Respuesta del servidor:", response.data); // Muestra la respuesta en consola.

            // Verifica que el servidor haya respondido con los datos necesarios.
            if (response.data.token && response.data.user_id && response.data.name) {
                // Guarda el token, el ID de usuario y el nombre en el localStorage.
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('name', JSON.stringify({ name: response.data.name }));

                alert('Login exitoso'); // Muestra un mensaje de éxito al usuario.
                navigate('/WelcomePage'); // Redirige a la página de bienvenida.
            } else {
                // Si faltan datos en la respuesta, muestra un mensaje de error.
                alert('Credenciales inválidas o datos incompletos del servidor.');
            }
        } catch (error) {
            // Captura errores y muestra mensajes de error adecuados.
            console.error('Error al iniciar sesión:', error.response?.data || error.message);
            alert('Error al iniciar sesión');
        }
    };

    return (
        <>
            <Navbar /> {/* Renderiza el componente de barra de navegación. */}
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Iniciar Sesión</h2>
                {/* Campo de entrada para el email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Actualiza el estado del email.
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                {/* Campo de entrada para la contraseña */}
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Actualiza el estado de la contraseña.
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                {/* Botón para iniciar sesión */}
                <button onClick={handleLogin} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    Iniciar Sesión
                </button>
                <br />
                {/* Nuevo botón para redirigir a la recuperación de contraseña */}
                <button
                    onClick={() => navigate('/forgot-password')}
                    style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'blue',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    }}
                >
                    ¿Olvidaste tu contraseña?
                </button>
            </div>
        </>
    );
}

export default Login; // Exporta el componente Login.
