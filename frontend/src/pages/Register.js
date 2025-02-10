import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../style/Register.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConsent(false);
  }, []);

  const handleRegister = async () => {
    try {
      console.log({ name, email, password });
      const response = await axios.post('http://127.0.0.1:5000/register', {
        name,
        email,
        password,
      });
      alert(response.data.message);
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Error desconocido al registrar el usuario.');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Registro de Usuario</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="terms-container">
          <input
            type="checkbox"
            id="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <label htmlFor="consent">
            Acepto los términos, condiciones y el uso de mis datos personales.
          </label>
        </div>
        <button
          onClick={handleRegister}
          disabled={!consent}
          className={`register-button ${!consent ? 'disabled' : ''}`}
        >
          Registrarse
        </button>
      </div>
      </div>
    </>
  );
}

export default Register;
