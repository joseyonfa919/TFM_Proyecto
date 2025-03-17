import Navbar from '../components/Navbar'; // Importa el componente de navegación
import React, { useState } from 'react'; // Importa React y el hook useState para manejar estados
import axios from 'axios'; // Importa Axios para hacer peticiones HTTP al backend
import '../style/ChangePassword.css'; // Importa el archivo de estilos CSS

function ChangePassword() {
    // Definir estados para manejar las entradas del usuario
    const [currentPassword, setCurrentPassword] = useState(''); // Estado para la contraseña actual
    const [newPassword, setNewPassword] = useState(''); // Estado para la nueva contraseña
    const [confirmPassword, setConfirmPassword] = useState(''); // Estado para confirmar la nueva contraseña

    // Función para manejar el cambio de contraseña
    const handleChangePassword = async () => {
        // Validación: Verificar si las nuevas contraseñas coinciden
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden'); // Mostrar alerta si no coinciden
            return;
        }

        try {
            // Obtener el user_id y el token almacenado en localStorage
            const user_id = localStorage.getItem('user_id');
            const token = localStorage.getItem('token');

            // Configuración de los headers para la autenticación
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`, // Enviar token en los headers
                },
            };

            // Enviar la solicitud POST al backend con los datos del usuario
            const response = await axios.post(
                'http://127.0.0.1:5000/change-password',
                {
                    user_id,
                    current_password: currentPassword, // Enviar la contraseña actual
                    new_password: newPassword, // Enviar la nueva contraseña
                },
                config // Configuración con el token de autenticación
            );

            // Mostrar mensaje de éxito recibido desde el backend
            alert(response.data.message);
        } catch (error) {
            console.error(error);
            // Mostrar un mensaje de error en caso de fallo
            alert(error.response?.data?.error || 'Error al cambiar la contraseña');
        }
    };

    return (
        <div>
            <Navbar /> {/* Componente de navegación */}
            <div className="change-password-container"> {/* Contenedor principal de la página */}

                <div className="change-password-box"> {/* Caja con el formulario para cambiar la contraseña */}
                    <h2 className="change-password-title">Cambiar Contraseña</h2> {/* Título */}

                    {/* Input para la contraseña actual */}
                    <input
                        type="password"
                        placeholder="Contraseña actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="change-password-input"
                    />

                    {/* Input para la nueva contraseña */}
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="change-password-input"
                    />

                    {/* Input para confirmar la nueva contraseña */}
                    <input
                        type="password"
                        placeholder="Confirmar nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="change-password-input"
                    />

                    {/* Botón para enviar la solicitud de cambio de contraseña */}
                    <button onClick={handleChangePassword} className="change-password-button">
                        Cambiar Contraseña
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword; // Exporta el componente para su uso en la aplicación
