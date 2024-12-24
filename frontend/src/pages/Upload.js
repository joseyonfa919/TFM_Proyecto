import React, { useState } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar"; // Importa el Navbar

function Upload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    console.log("Token obtenido:", token); // Depuración
  
    if (!token) {
      return alert("No estás autenticado. Por favor, inicia sesión.");
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert('Imagen subida con éxito');
      console.log(response.data);
    } catch (error) {
      alert('Error al subir la imagen');
      console.error(error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <Navbar />
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Subir Foto</h2>
          <input type="file" onChange={handleFileChange} />
          <br />
          <button onClick={handleUpload} style={{ marginTop: '10px', padding: '8px 16px' }}>
            Subir Imagen
          </button>
      </div>
    </div>
  );
}

export default Upload;
