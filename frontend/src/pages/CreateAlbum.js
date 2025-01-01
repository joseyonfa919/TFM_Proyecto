import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateAlbum() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [albumName, setAlbumName] = useState('');

  useEffect(() => {
    // Obtener fotos del usuario autenticado
    axios.get('http://127.0.0.1:5000/photos', {
      params: { user_id: localStorage.getItem('user_id') }, // Asegúrate de guardar el user_id en el localStorage
    }).then((response) => {
      setPhotos(response.data);
    }).catch((error) => {
      console.error('Error al obtener las fotos:', error);
    });
  }, []);

  const handleCreateAlbum = () => {
    if (!albumName || selectedPhotos.length === 0) {
      alert('El nombre del álbum y al menos una foto son obligatorios.');
      return;
    }

    axios.post('http://127.0.0.1:5000/albums', {
      name: albumName,
      photo_ids: selectedPhotos,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then((response) => {
      alert(response.data.message);
      setAlbumName('');
      setSelectedPhotos([]);
    }).catch((error) => {
      console.error('Error al crear el álbum:', error);
    });
  };

  return (
    <div>
      <h2>Crear un Álbum</h2>
      <input
        type="text"
        placeholder="Nombre del álbum"
        value={albumName}
        onChange={(e) => setAlbumName(e.target.value)}
      />
      <div>
        <h3>Selecciona fotos:</h3>
        {photos.map((photo) => (
          <div key={photo.id}>
            <input
              type="checkbox"
              value={photo.id}
              onChange={(e) => {
                const photoId = parseInt(e.target.value);
                setSelectedPhotos((prev) =>
                  e.target.checked
                    ? [...prev, photoId]
                    : prev.filter((id) => id !== photoId)
                );
              }}
            />
            <label>{photo.file_name}</label>
          </div>
        ))}
      </div>
      <button onClick={handleCreateAlbum}>Crear Álbum</button>
    </div>
  );
}

export default CreateAlbum;
