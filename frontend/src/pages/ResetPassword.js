import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ResetPassword() {
    const { token } = useParams(); // Obtén el token de la URL
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/reset-password', {
                token,
                new_password: newPassword,
            });
            setMessage(response.data.message);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Error al restablecer la contraseña.');
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Restablecer Contraseña</h2>
            <form onSubmit={handleResetPassword}>
                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                <button type="submit" style={{ padding: '8px 16px' }}>
                    Restablecer
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default ResetPassword;
