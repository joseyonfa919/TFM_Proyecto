import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewAlbums() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    // Obtener álbumes del usuario autenticado
    axios.get('http://127.0.0.1:5000/albums', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then((response) => {
      setAlbums(response.data);
    }).catch((error) => {
      console.error('Error al obtener los álbumes:', error);
    });
  }, []);

  return (
    <div>
      <h2>Mis Álbumes</h2>
      {albums.map((album) => (
        <div key={album.id}>
          <h3>{album.name}</h3>
          <div>
            {album.photos.map((photo) => (
              <img
                key={photo.id}
                src={`http://127.0.0.1:5000/uploads/${photo.file_path}`}
                alt={photo.file_name}
                style={{ width: '100px', margin: '5px' }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ViewAlbums;
