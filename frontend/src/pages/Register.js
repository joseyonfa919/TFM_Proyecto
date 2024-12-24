import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/register', { name, email, password });
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      alert('Error al registrar el usuario');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Registro de Usuario</h2>
        <input
          type="text"
          placeholder="Nombre"
          onChange={(e) => setName(e.target.value)}
          style={{ margin: '10px', padding: '8px' }}
        />
        <br />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{ margin: '10px', padding: '8px' }}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
          style={{ margin: '10px', padding: '8px' }}
        />
        <br />
        <button onClick={handleRegister} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Registrarse
        </button>
      </div>
    </>
  );
}

export default Register;
