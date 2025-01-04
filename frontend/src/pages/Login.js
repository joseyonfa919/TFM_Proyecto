import React, { useState } from 'react'; // Importar React y el hook useState para manejar estados
import axios from 'axios'; // Biblioteca para realizar solicitudes HTTP
import { useNavigate } from 'react-router-dom'; // Hook para redirigir entre rutas
import Navbar from '../components/Navbar'; // Componente de navegación

// Componente funcional para manejar el inicio de sesión
function Login() {
    // Estados para capturar el email y la contraseña del usuario
    const [email, setEmail] = useState(''); // Estado para el correo electrónico
    const [password, setPassword] = useState(''); // Estado para la contraseña
    const navigate = useNavigate(); // Hook para manejar la redirección de rutas

    // Función para manejar el evento de inicio de sesión
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        try {
            // Realizar una solicitud POST al servidor para autenticar al usuario
            const response = await axios.post('http://127.0.0.1:5000/login', { email, password });
            console.log('Respuesta del servidor:', response.data); // Mostrar la respuesta del servidor en la consola

            // Verificar si el servidor envió un token y otros datos necesarios
            if (response.data.token && response.data.user_id && response.data.name) {
                // Guardar el token, user_id y nombre en localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('name', JSON.stringify({ name: response.data.name }));

                alert('Login exitoso'); // Notificar al usuario
                navigate('/WelcomePage'); // Redirigir al usuario a la página de bienvenida
            } else {
                // Mostrar alerta si las credenciales son inválidas o faltan datos
                alert('Credenciales inválidas o datos incompletos del servidor.');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error); // Mostrar el error en la consola
            alert('Error al iniciar sesión'); // Notificar al usuario
        }
    };

    return (
        <>
            <Navbar /> {/* Componente de navegación */}
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Iniciar Sesión</h2>
                {/* Campo de entrada para el correo electrónico */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Actualizar el estado del correo electrónico
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                {/* Campo de entrada para la contraseña */}
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Actualizar el estado de la contraseña
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                {/* Botón para enviar el formulario de inicio de sesión */}
                <button onClick={handleLogin} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    Iniciar Sesión
                </button>
            </div>
        </>
    );
}

export default Login; // Exportar el componente para que pueda ser utilizado en otras partes del proyecto
