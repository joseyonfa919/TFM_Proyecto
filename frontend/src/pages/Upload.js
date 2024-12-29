import React, { useState } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar"; // Asegúrate de que este componente existe

function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [error, setError] = useState(null); // Para manejar errores

  // Manejar el cambio de archivo seleccionado
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null); // Limpiar errores anteriores
  };

  // Subir archivo al servidor
  const handleUpload = async () => {

    if (!file) {
      setError("Por favor, selecciona un archivo.");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
  

    const formData = new FormData();
    formData.append('file', file);


    // Imprime todas las entradas del FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    //console.log("Archivo seleccionado:", file); // Log para depuración

    try 
    {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, { 
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      alert('Imagen subida con éxito');
      console.log(response.data);
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
        <input type="file" onChange={handleFileChange} />
        <br />
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>} {/* Mostrar errores */}
        <button 
          onClick={handleUpload} 
          style={{ marginTop: '10px', padding: '8px 16px' }}
          disabled={loading} // Deshabilitar botón si está cargando
        >
          {loading ? "Subiendo..." : "Subir Imagen"} {/* Mostrar estado */}
        </button>
      </div>
    </div>
  );
}

export default Upload;
