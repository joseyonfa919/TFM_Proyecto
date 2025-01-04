import React, { useState } from 'react'; // Importar React y el hook useState para manejar estados
import axios from 'axios'; // Biblioteca para realizar solicitudes HTTP
import { useNavigate } from 'react-router-dom'; // Hook para redirigir entre rutas
import Navbar from '../components/Navbar'; // Componente de navegación

// Componente funcional para el registro de nuevos usuarios
function Register() {
  // Estados para manejar los datos del formulario de registro
  const [name, setName] = useState(''); // Estado para el nombre del usuario
  const [email, setEmail] = useState(''); // Estado para el correo electrónico
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const navigate = useNavigate(); // Hook para manejar la redirección de rutas

  // Función para manejar el registro de usuarios
  const handleRegister = async () => {
    try {
      console.log({ name, email, password }); // Imprimir los datos del usuario en la consola para depuración
      // Realizar una solicitud POST al servidor para registrar un nuevo usuario
      const response = await axios.post('http://127.0.0.1:5000/register', {
        name, // Enviar el nombre del usuario
        email, // Enviar el correo electrónico
        password, // Enviar la contraseña
      });
      alert(response.data.message); // Mostrar el mensaje recibido del servidor
      navigate('/login'); // Redirigir al usuario a la página de inicio de sesión
    } catch (error) {
      // Manejar errores en la solicitud
      if (error.response && error.response.data.message) {
        // Mostrar el mensaje de error enviado por el servidor
        alert(error.response.data.message);
      } else {
        // Mostrar un mensaje genérico en caso de un error desconocido
        alert('Error desconocido al registrar el usuario.');
      }
    }
  };

  return (
    <>
      <Navbar /> {/* Componente de navegación */}
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Registro de Usuario</h2>
        {/* Campo de entrada para el nombre del usuario */}
        <input
          type="text"
          placeholder="Nombre"
          onChange={(e) => setName(e.target.value)} // Actualizar el estado del nombre
          style={{ margin: '10px', padding: '8px' }}
        />
        <br />
        {/* Campo de entrada para el correo electrónico */}
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)} // Actualizar el estado del correo electrónico
          style={{ margin: '10px', padding: '8px' }}
        />
        <br />
        {/* Campo de entrada para la contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)} // Actualizar el estado de la contraseña
          style={{ margin: '10px', padding: '8px' }}
        />
        <br />
        {/* Botón para enviar el formulario de registro */}
        <button onClick={handleRegister} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Registrarse
        </button>
      </div>
    </>
  );
}

export default Register; // Exportar el componente para usarlo en otras partes del proyecto
