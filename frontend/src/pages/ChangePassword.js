import Navbar from '../components/Navbar';
import React, { useState } from 'react';
import axios from 'axios';
import '../style/ChangePassword.css'; // Importa el CSS

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            const user_id = localStorage.getItem('user_id');
            const token = localStorage.getItem('token');

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.post(
                'http://127.0.0.1:5000/change-password',
                {
                    user_id,
                    current_password: currentPassword,
                    new_password: newPassword,
                },
                config
            );

            alert(response.data.message);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al cambiar la contraseña');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="change-password-container">

                <div className="change-password-box">
                    <h2 className="change-password-title">Cambiar Contraseña</h2>
                    <input
                        type="password"
                        placeholder="Contraseña actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="change-password-input"
                    />
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="change-password-input"
                    />
                    <input
                        type="password"
                        placeholder="Confirmar nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="change-password-input"
                    />
                    <button onClick={handleChangePassword} className="change-password-button">
                        Cambiar Contraseña
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;
