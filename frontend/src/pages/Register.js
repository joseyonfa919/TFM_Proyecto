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
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({}); // Estado para errores visuales
  const navigate = useNavigate();

  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConsent(false);
  }, []);

  const handleRegister = async () => {
    setErrorMessage('');
    let newErrors = {};

    // ✅ Validación de campos obligatorios
    if (!name.trim()) newErrors.name = true;
    if (!email.trim()) newErrors.email = true;
    if (!password.trim()) newErrors.password = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    // ✅ Validación de aceptación de términos
    if (!consent) {
      setErrorMessage('Debes aceptar los términos y condiciones.');
      return;
    }

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
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error desconocido al registrar el usuario.');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
        <div className="register-box">
          <h2 className="register-title">Registro de Usuario</h2>

          {/* Mensaje de error si hay campos vacíos */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="input-group">
            <label className="input-label">Nombre <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: false });
              }}
              className={`register-input ${errors.name ? 'input-error' : ''}`}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email <span className="required">*</span></label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: false });
              }}
              className={`register-input ${errors.email ? 'input-error' : ''}`}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña <span className="required">*</span></label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: false });
              }}
              className={`register-input ${errors.password ? 'input-error' : ''}`}
              required
            />
          </div>

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
