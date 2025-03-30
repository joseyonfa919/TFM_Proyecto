import React, { useState } from 'react'; // Importa React y el hook useState para manejar estados
import axios from 'axios'; // Importa Axios para realizar peticiones HTTP al backend
import { useParams, useNavigate } from 'react-router-dom'; // Importa hooks para navegación y parámetros de URL
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación
import '../style/Navbar.css';
import '../style/ResetPasswordStyles.css'; // Importa los estilos personalizados para este componente

// =========================== COMPONENTE PRINCIPAL RESET PASSWORD ===========================

function ResetPassword() {
    const { token } = useParams(); // Obtiene el token de restablecimiento desde la URL
    const navigate = useNavigate(); // Hook para redireccionar programáticamente
    const [newPassword, setNewPassword] = useState(''); // Estado para almacenar la nueva contraseña
    const [message, setMessage] = useState(''); // Estado para manejar mensajes de éxito o error
    const [loading, setLoading] = useState(false); // Estado para controlar el spinner

    // =========================== MANEJAR EL ENVÍO DEL FORMULARIO ===========================

    const handleResetPassword = async (e) => {
        e.preventDefault(); // Evita que el formulario recargue la página
        setLoading(true); // Mostrar spinner

        try {
            const response = await axios.post('http://127.0.0.1:5000/reset-password', {
                token,
                new_password: newPassword,
            });

            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false); // Ocultar spinner
        }
    };

    return (
        <>
            <Navbar />
            <div className="reset-container">
                <h2>Restablecer Contraseña</h2>
                <form onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="reset-input"
                        disabled={loading}
                    />
                    <br />
                    <button type="submit" className="reset-button" disabled={loading}>
                        {loading ? <div className="spinner-button"></div> : 'Restablecer'}
                    </button>
                </form>
                {message && <p className="reset-message">{message}</p>}
            </div>
        </>
    );
}

export default ResetPassword;
