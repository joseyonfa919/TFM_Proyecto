import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function ViewAlbums() {
    const [albums, setAlbums] = useState([]);
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        if (!userId) {
            console.error('No se encontró user_id en localStorage');
            return;
        }

        axios.get(`http://127.0.0.1:5000/albums?user_id=${userId}`)
            .then(response => {
                setAlbums(response.data || []);  // Asegura que response.data se use correctamente
            })
            .catch(error => {
                console.error('Error al obtener los álbumes:', error);
            });
    }, [userId]);

    return (
        <div>
            <Navbar />
            <h2 style={{ textAlign: 'center', color: '#333' }}>Selecciona un Álbum para la Cronología</h2>
            <div style={{ padding: '20px' }}>
                {albums.length === 0 ? (
                    <p>No hay álbumes disponibles</p>
                ) : (
                    albums.map(album => (
                        <div key={album.id} style={{ marginBottom: '20px' }}>
                            <h3>{album.name}</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {album.photos && album.photos.length > 0 ? (
                                    album.photos.map(photo => (
                                        <img
                                            key={photo.id}
                                            src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
                                            alt={photo.file_name}
                                            style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '5px' }}
                                        />
                                    ))
                                ) : (
                                    <p>No hay fotos en este álbum</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ViewAlbums;
