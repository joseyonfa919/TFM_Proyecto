import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../style/ViewAlbums.css';

function ViewAlbums() {
    const [albums, setAlbums] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredAlbums = albums.filter(album =>
        album.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="albums-container">
            <Navbar />
            <h2 className="title">Mis Álbumes</h2>
            <div className="search-container">
                <input 
                    type="text" 
                    placeholder="🔍 Buscar álbum..." 
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="albums-list">
                {filteredAlbums.length === 0 ? (
                    <p className="no-albums">No hay álbumes disponibles</p>
                ) : (
                    filteredAlbums.map(album => (
                        <div key={album.id} className="album-card">
                            <h3 className="album-title">{album.name}</h3>
                            <button 
                                onClick={() => handleDeleteAlbum(album.id)}
                                className="delete-button"
                            >
                                🗑️ Eliminar Álbum
                            </button>
                            <div className="photo-grid">
                                {album.photos && album.photos.length > 0 ? (
                                    album.photos.map(photo => (
                                        <img
                                            key={photo.id}
                                            src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
                                            alt={photo.file_name}
                                            className="photo-thumbnail"
                                        />
                                    ))
                                ) : (
                                    <p className="no-photos">No hay fotos en este álbum</p>
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
