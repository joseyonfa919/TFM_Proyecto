
import Navbar from '../components/Navbar';
import React, { useState } from 'react';
import axios from 'axios';

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            // Obtener user_id y token desde localStorage
            const user_id = localStorage.getItem('user_id');
            const token = localStorage.getItem('token');

            // Configurar encabezados con el token
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Enviar la solicitud al backend
            const response = await axios.post(
                'http://127.0.0.1:5000/change-password',
                {
                    user_id, // Enviar user_id directamente
                    current_password: currentPassword,
                    new_password: newPassword,
                },
                config
            );

            alert(response.data.message);
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.error ||
                'Error al cambiar la contraseña'
            );
        }
    };

    return (
        <div>
            <Navbar/>
            <h2>Cambiar Contraseña</h2>
            <input
                type="password"
                placeholder="Contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleChangePassword}>
                Cambiar Contraseña
            </button>
        </div>
    );
}

export default ChangePassword;
