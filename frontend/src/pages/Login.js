import React, { useState } from 'react'; // Importa React y el hook useState para manejar estados
import axios from 'axios'; // Importa Axios para realizar peticiones HTTP al backend
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para manejar redirecciones
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación
import '../style/Login.css'; // Importa los estilos CSS específicos para este componente

// =========================== COMPONENTE PRINCIPAL LOGIN ===========================

function Login() {
    // Estado para almacenar los datos del formulario (correo y contraseña)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Hook para manejar la navegación entre rutas

    // =========================== FUNCIÓN PARA MANEJAR EL LOGIN ===========================

    const handleLogin = async (e) => {
        e.preventDefault(); // Evita que la página se recargue al enviar el formulario
        
        try {
            console.log("Enviando datos:", { email, password }); // Muestra en consola los datos enviados
            const response = await axios.post('http://127.0.0.1:5000/login', { email, password });

            // Verificar si la respuesta contiene los datos necesarios
            if (response.data.token && response.data.user_id && response.data.name) {
                // Almacenar los datos del usuario en localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user_id', response.data.user_id);
                localStorage.setItem('name', JSON.stringify({ name: response.data.name }));

                //alert('Login exitoso'); // Mostrar alerta de éxito
                navigate('/WelcomePage'); // Redirigir a la página de bienvenida
            } else {
                alert('Credenciales inválidas o datos incompletos del servidor.'); // Mostrar alerta en caso de datos incompletos
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error.response?.data || error.message);
            alert('Error al iniciar sesión'); // Mostrar mensaje de error en caso de fallo
        }
    };

    return (
        <>
            <Navbar /> {/* Incluir la barra de navegación */}
            <div className="login-container"> {/* Contenedor principal */}
                <div className="login-card"> {/* Tarjeta de inicio de sesión */}
                    
                    <h2 className="login-title">Iniciar Sesión</h2> {/* Título principal */}

                    {/* Campo de entrada para el correo electrónico */}
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                    />

                    {/* Campo de entrada para la contraseña */}
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                    />

                    {/* Botón para iniciar sesión */}
                    <button onClick={handleLogin} className="login-button">
                        Iniciar Sesión
                    </button>

                    {/* Botón para redirigir a la recuperación de contraseña */}
                    <button onClick={() => navigate('/forgot-password')} className="forgot-password">
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
            </div>
        </>
    );
}

export default Login; // Exporta el componente para usarlo en la aplicación
