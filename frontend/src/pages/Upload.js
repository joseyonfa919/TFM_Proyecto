import React, { useState, useRef } from 'react'; // Importar React, hooks useState y useRef
import axios from 'axios'; // Biblioteca para realizar solicitudes HTTP
import Navbar from "../components/Navbar"; // Componente de navegación

// Componente funcional para manejar la subida de imágenes
function Upload() {
  // Estados para manejar el archivo seleccionado, el estado de carga y errores
  const [file, setFile] = useState(null); // Estado para almacenar el archivo seleccionado
  const [loading, setLoading] = useState(false); // Estado para indicar si se está cargando
  const [error, setError] = useState(null); // Estado para almacenar mensajes de error

  const fileInputRef = useRef(); // Referencia al input de archivo para controlarlo directamente

  // Función para manejar el cambio en el input de archivo
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Guardar el archivo seleccionado en el estado
    setError(null); // Limpiar errores anteriores
  };

  // Función para manejar la subida del archivo
  const handleUpload = async () => {
    if (!file) {
      // Mostrar error si no se ha seleccionado un archivo
      setError("Por favor, selecciona un archivo.");
      return;
    }

    const userId = localStorage.getItem("user_id"); // Obtener el ID del usuario desde localStorage
    if (!userId) {
      // Mostrar error si no se encuentra el ID del usuario
      setError("No se encontró el ID del usuario en localStorage.");
      return;
    }

    // Crear un objeto FormData para enviar el archivo y el user_id al backend
    const formData = new FormData();
    formData.append('file', file); // Añadir el archivo
    formData.append('user_id', userId); // Añadir el user_id

    try {
      setLoading(true); // Activar el estado de carga
      // Realizar la solicitud POST al backend para subir el archivo
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Establecer encabezado de contenido
        },
      });

      alert('Imagen subida con éxito'); // Notificar al usuario que la imagen se subió con éxito
      console.log(response.data); // Mostrar la respuesta del backend en la consola

      // Restablecer el archivo seleccionado después de la subida exitosa
      setFile(null);
      fileInputRef.current.value = ""; // Limpiar el valor del input de archivo

    } catch (error) {
      // Manejar errores en la solicitud
      console.error(error.response ? error.response.data : error.message); // Mostrar el error en consola
      setError(error.response?.data?.message || "Error al subir la imagen."); // Mostrar mensaje de error al usuario
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <div>
      <Navbar /> {/* Componente de navegación */}
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Subir Foto o Video</h2>
        {/* Input para seleccionar un archivo */}
        <input
          type="file"
          accept="image/*,video/*" // Permitir imágenes y videos
          ref={fileInputRef} // Asignar referencia al input
          onChange={handleFileChange} // Llamar a handleFileChange al seleccionar un archivo
        />
        <br />
        {/* Mostrar mensaje de error si existe */}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {/* Botón para subir el archivo */}
        <button
          onClick={handleUpload} // Llamar a handleUpload al hacer clic
          style={{ marginTop: '10px', padding: '8px 16px' }}
          disabled={loading} // Deshabilitar el botón si está en estado de carga
        >
          {loading ? "Subiendo..." : "Subir Imagen"} {/* Mostrar texto según el estado de carga */}
        </button>
      </div>
    </div>
  );
}

export default Upload; // Exportar el componente para usarlo en otras partes del proyecto
