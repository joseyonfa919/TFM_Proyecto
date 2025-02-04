import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function ViewAlbums() {
    const [albums, setAlbums] = useState([]);
    const userId = localStorage.getItem('user_id');
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            console.error('No se encontró user_id en localStorage');
            return;
        }

        axios.get(`http://127.0.0.1:5000/albums?user_id=${userId}`)
            .then(response => {
                setAlbums(response.data || []);
            })
            .catch(error => {
                console.error('Error al obtener los álbumes:', error);
            });
    }, [userId]);

    const handleSelectAlbum = (albumId) => {
        navigate(`/create-timeline/${albumId}`);
    };

    const handleDeleteAlbum = (albumId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este álbum? Esta acción no se puede deshacer.')) {
            axios.delete(`http://127.0.0.1:5000/albums/${albumId}`)
                .then(() => {
                    setAlbums(albums.filter(album => album.id !== albumId));
                    alert('Álbum eliminado correctamente.');
                })
                .catch(error => {
                    console.error('Error al eliminar el álbum:', error);
                    alert('Hubo un error al eliminar el álbum.');
                });
        }
    };

    return (
        <div>
            <Navbar />
            <h2 style={{ textAlign: 'center', color: '#333' }}>Selecciona un Álbum para la Cronología</h2>
            <div style={{ padding: '20px' }}>
                {albums.length === 0 ? (
                    <p>No hay álbumes disponibles</p>
                ) : (
                    albums.map(album => (
                        <div key={album.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                            <h3>{album.name}</h3>
                            <button 
                                onClick={() => handleDeleteAlbum(album.id)}
                                style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginBottom: '10px' }}
                            >
                                Eliminar Álbum
                            </button>
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
