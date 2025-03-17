import React, { useState } from 'react'; // Importa React y el hook useState para manejar estados
import axios from 'axios'; // Importa Axios para realizar peticiones HTTP al backend
import { useParams } from 'react-router-dom'; // Importa useParams para obtener parámetros de la URL
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación

// =========================== COMPONENTE PRINCIPAL RESET PASSWORD ===========================

function ResetPassword() {
    const { token } = useParams(); // Obtiene el token de restablecimiento desde la URL
    const [newPassword, setNewPassword] = useState(''); // Estado para almacenar la nueva contraseña
    const [message, setMessage] = useState(''); // Estado para manejar mensajes de éxito o error

    // =========================== MANEJAR EL ENVÍO DEL FORMULARIO ===========================

    const handleResetPassword = async (e) => {
        e.preventDefault(); // Evita que el formulario recargue la página
        
        try {
            // Enviar solicitud al backend con el token y la nueva contraseña
            const response = await axios.post('http://127.0.0.1:5000/reset-password', {
                token,
                new_password: newPassword,
            });

            setMessage(response.data.message); // Mostrar mensaje de éxito recibido del backend
        } catch (error) {
            console.error(error);
            // Mostrar mensaje de error si la solicitud falla
            setMessage(error.response?.data?.message || 'Error al restablecer la contraseña.');
        }
    };

    return (
        <div>
            <Navbar /> {/* Renderiza el componente de barra de navegación */}
            
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Restablecer Contraseña</h2> {/* Título principal */}

                {/* Formulario para ingresar la nueva contraseña */}
                <form onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ margin: '10px', padding: '8px' }}
                    />
                    <br />
                    {/* Botón para enviar la solicitud de cambio de contraseña */}
                    <button type="submit" style={{ padding: '8px 16px' }}>
                        Restablecer
                    </button>
                </form>

                {/* Mostrar mensaje de éxito o error */}
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default ResetPassword; // Exporta el componente para su uso en la aplicación
