import React, { useState,useRef  } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar"; // Asegúrate de que este componente existe

function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(); // Referencia para el input de archivo

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo.");
      return;
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("No se encontró el ID del usuario en localStorage.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId); // Agregar el user_id desde localStorage

    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Imagen subida con éxito');
      console.log(response.data);

      // Limpiar el archivo seleccionado
      setFile(null);
      fileInputRef.current.value = ""; // Restablecer el valor del input de archivo

    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Error al subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Subir Foto</h2>
        <input type="file" 
          ref={fileInputRef} // Asignar la referencia al input
          onChange={handleFileChange} />
        <br />
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        <button 
          onClick={handleUpload} 
          style={{ marginTop: '10px', padding: '8px 16px' }}
          disabled={loading}
        >
          {loading ? "Subiendo..." : "Subir Imagen"}
        </button>
      </div>
    </div>
  );
}

export default Upload;
