import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function ViewAlbums() {
    const [albums, setAlbums] = useState([]);
    const [selectedAlbums, setSelectedAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('user_id'); // Obtener el user_id desde localStorage
        if (!userId) {
            console.error('No se encontró user_id en localStorage');
            setLoading(false);
            return;
        }

        axios
            .get('http://127.0.0.1:5000/albums', {
                params: { user_id: userId }, // Enviar el user_id como parámetro
            })
            .then((response) => {
                setAlbums(response.data);
            })
            .catch((error) => {
                console.error('Error al obtener los álbumes:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleDeleteAlbums = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario en localStorage.');
            return;
        }

        if (selectedAlbums.length === 0) {
            alert('Por favor selecciona al menos un álbum para eliminar.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/albums/delete', {
                user_id: userId,
                album_ids: selectedAlbums,
            });
            alert(response.data.message);
            // Actualizar los álbumes después de eliminar
            setAlbums((prev) => prev.filter((album) => !selectedAlbums.includes(album.id)));
            setSelectedAlbums([]); // Limpiar los álbumes seleccionados
        } catch (error) {
            console.error('Error al eliminar álbumes:', error);
            alert('Error al eliminar los álbumes.');
        }
    };

    return (
        <div>
            <Navbar />
            <h2 style={{ textAlign: 'center' }}>Mis Álbumes</h2>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button
                    onClick={handleDeleteAlbums}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#ff4d4d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                    disabled={albums.length === 0} // Deshabilitar botón si no hay álbumes
                >
                    Eliminar Álbumes Seleccionados
                </button>
            </div>
            {loading ? (
                <p style={{ textAlign: 'center' }}>Cargando álbumes...</p>
            ) : albums.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No tienes álbumes creados.</p>
            ) : (
                albums.map((album) => (
                    <div key={album.id} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            value={album.id}
                            onChange={(e) => {
                                const albumId = parseInt(e.target.value, 10);
                                setSelectedAlbums((prev) =>
                                    e.target.checked
                                        ? [...prev, albumId]
                                        : prev.filter((id) => id !== albumId)
                                );
                            }}
                            style={{ marginRight: '10px' }} // Espaciado entre el checkbox y el texto
                        />
                        <div>
                            <h3 style={{ margin: '0' }}>{album.name}</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {album.photos.map((photo) => (
                                    <img
                                        key={photo.id}
                                        src={`http://127.0.0.1:5000/uploads/${photo.file_path}`}
                                        alt={photo.file_name}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            margin: '5px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default ViewAlbums;
