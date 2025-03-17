import React, { useState, useEffect } from 'react'; // Importa React y los hooks useState y useEffect para manejar estados y efectos
import axios from 'axios'; // Importa Axios para realizar peticiones HTTP al backend
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para manejar redirecciones
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación
import '../style/Register.css'; // Importa los estilos CSS específicos para este componente

// =========================== COMPONENTE PRINCIPAL REGISTER ===========================

function Register() {
  // Estados para almacenar la información del formulario y manejar errores
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({}); // Estado para manejar errores visuales en los inputs
  const navigate = useNavigate(); // Hook para manejar la navegación entre rutas

  // =========================== REINICIAR ESTADOS AL MONTAR EL COMPONENTE ===========================

  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConsent(false);
  }, []);

  // =========================== FUNCIÓN PARA MANEJAR EL REGISTRO ===========================

  const handleRegister = async () => {
    setErrorMessage(''); // Limpiar mensaje de error previo
    let newErrors = {}; // Objeto para almacenar errores en los campos

    // ✅ Validación de campos obligatorios
    if (!name.trim()) newErrors.name = true;
    if (!email.trim()) newErrors.email = true;
    if (!password.trim()) newErrors.password = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Actualizar el estado de errores
      setErrorMessage('Todos los campos son obligatorios.'); // Mostrar mensaje de error
      return;
    }

    // ✅ Validación de aceptación de términos
    if (!consent) {
      setErrorMessage('Debes aceptar los términos y condiciones.');
      return;
    }

    try {
      console.log({ name, email, password }); // Imprime en consola los datos enviados (depuración)
      // Enviar solicitud al backend con los datos del usuario
      const response = await axios.post('http://127.0.0.1:5000/register', {
        name,
        email,
        password,
      });

      alert(response.data.message); // Mostrar mensaje de éxito recibido del backend
      navigate('/login'); // Redirigir a la pantalla de inicio de sesión
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message); // Mostrar error específico del backend
      } else {
        setErrorMessage('Error desconocido al registrar el usuario.');
      }
    }
  };

  return (
    <>
      <Navbar /> {/* Incluir la barra de navegación */}
      <div className="register-container">
        <div className="register-box">
          <h2 className="register-title">Registro de Usuario</h2> {/* Título principal */}

          {/* Mensaje de error si hay campos vacíos o problemas en el backend */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Campo de entrada para el nombre */}
          <div className="input-group">
            <label className="input-label">Nombre <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: false }); // Limpiar el error si el usuario ingresa datos
              }}
              className={`register-input ${errors.name ? 'input-error' : ''}`} // Agregar clase de error si el campo está vacío
              required
            />
          </div>

          {/* Campo de entrada para el email */}
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

          {/* Campo de entrada para la contraseña */}
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

          {/* Checkbox para aceptar términos y condiciones */}
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

          {/* Botón de registro */}
          <button
            onClick={handleRegister}
            disabled={!consent} // Desactivar el botón si el usuario no ha aceptado los términos
            className={`register-button ${!consent ? 'disabled' : ''}`}
          >
            Registrarse
          </button>
        </div>
      </div>
    </>
  );
}

export default Register; // Exporta el componente para usarlo en la aplicación
