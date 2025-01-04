import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('La nueva contraseña y la confirmación no coinciden.');
            return;
        }

        try {
            console.log('Paso1:')
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No se encontró un token. Por favor, inicia sesión nuevamente.');
                navigate('/login');
                return;
            }
            console.log('Paso2:',token)
            const response = await axios.post(
                'http://127.0.0.1:5000/change-password',
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Paso3:', response.data);

            if (response.data.success) {
                alert('Contraseña cambiada exitosamente');
                navigate('/WelcomePage'); // Redirige a la página de perfil u otra ruta
            } else {
                alert('Error al cambiar la contraseña. Verifica tus datos.');
            }
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            if (error.response && error.response.data.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Error al cambiar la contraseña. Inténtalo de nuevo más tarde.');
            }
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Cambiar Contraseña</h2>
                <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ margin: '10px', padding: '8px' }}
                />
                <br />
                <button onClick={handleChangePassword} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    Cambiar Contraseña
                </button>
            </div>
        </>
    );
}

export default ChangePassword;