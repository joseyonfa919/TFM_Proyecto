import React, { useState } from 'react'; // Importa React y el hook useState para manejar estados
import axios from 'axios'; // Importa Axios para realizar peticiones HTTP al backend
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para manejar redirecciones
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación
import '../style/ForgotPassword.css'; // Importa los estilos CSS específicos para este componente

const ForgotPassword = () => {
    // Estado para almacenar el correo ingresado por el usuario
    const [email, setEmail] = useState('');
    // Estado para almacenar mensajes de éxito o error
    const [message, setMessage] = useState('');
    // Estado para manejar la carga del formulario
    const [loading, setLoading] = useState(false);
    // Hook para redireccionar a otras páginas
    const navigate = useNavigate();

    // =========================== MANEJAR ENVÍO DEL FORMULARIO ===========================

    const handleForgotPassword = async (e) => {
        e.preventDefault(); // Evita que el formulario recargue la página
        setLoading(true); // Indica que la solicitud está en proceso
        setMessage(''); // Limpia cualquier mensaje previo
        
        try {
            // Enviar solicitud al backend con el correo ingresado
            const response = await axios.post('http://127.0.0.1:5000/forgot-password', { email });

            // Mostrar mensaje de éxito recibido del backend
            setMessage(response.data.message);
            setEmail(''); // Limpiar el campo de texto después de enviar la solicitud
        } catch (error) {
            console.error(error);
            // Mostrar mensaje de error en caso de fallo
            setMessage(error.response?.data?.message || 'Error al enviar la solicitud.');
        }
    
        setLoading(false); // Finalizar estado de carga
    };

    return (
        <>
            <Navbar /> {/* Incluir la barra de navegación */}
            <div className="forgot-password-container">
                <div className="forgot-password-card">
                    <h2 className="forgot-password-title">Recuperación de Contraseña</h2>
                    <p className="forgot-password-text">
                        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    <form onSubmit={handleForgotPassword}>
                        {/* Campo de entrada para el correo */}
                        <input
                            type="email"
                            placeholder="Ingresa tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="forgot-password-input"
                            required
                        />
                        {/* Botón de envío del formulario */}
                        <button type="submit" className="forgot-password-button" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                    </form>
                    {/* Mostrar mensaje de éxito o error */}
                    {message && <p className="forgot-password-message">{message}</p>}
                    {/* Botón para regresar a la pantalla de inicio de sesión */}
                    <button onClick={() => navigate('/login')} className="back-to-login">
                        Volver a Iniciar Sesión
                    </button>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword; // Exportar el componente para su uso en la aplicación
