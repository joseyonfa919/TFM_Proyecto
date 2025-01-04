import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function ViewAlbums() {
    // Estados para manejar álbumes, álbumes seleccionados, estado de carga y enlace para compartir
    const [albums, setAlbums] = useState([]); // Lista de álbumes del usuario
    const [selectedAlbums, setSelectedAlbums] = useState([]); // Álbumes seleccionados para eliminar
    const [loading, setLoading] = useState(true); // Estado de carga
    const [shareLink, setShareLink] = useState(''); // Enlace generado para compartir un álbum

    // Efecto para cargar los álbumes del usuario cuando el componente se monta
    useEffect(() => {
        const userId = localStorage.getItem('user_id'); // Obtener el user_id desde localStorage
        if (!userId) {
            console.error('No se encontró user_id en localStorage');
            setLoading(false);
            return;
        }

        // Solicitud para obtener los álbumes del usuario
        axios
            .get('http://127.0.0.1:5000/albums', {
                params: { user_id: userId }, // Pasar el user_id como parámetro
            })
            .then((response) => {
                setAlbums(response.data); // Guardar álbumes en el estado
            })
            .catch((error) => {
                console.error('Error al obtener los álbumes:', error);
            })
            .finally(() => {
                setLoading(false); // Finalizar la carga
            });
    }, []);

    // Función para manejar la eliminación de álbumes seleccionados
    const handleDeleteAlbums = () => {
        if (selectedAlbums.length === 0) {
            alert('Selecciona al menos un álbum para eliminar.');
            return;
        }

        // Solicitud para eliminar los álbumes seleccionados
        axios
            .post('http://127.0.0.1:5000/albums/delete', { album_ids: selectedAlbums })
            .then((response) => {
                alert('Álbum(es) eliminado(s) con éxito.');
                // Actualizar la lista de álbumes eliminando los seleccionados
                setAlbums((prevAlbums) =>
                    prevAlbums.filter((album) => !selectedAlbums.includes(album.id))
                );
                setSelectedAlbums([]); // Limpiar selección
            })
            .catch((error) => {
                console.error('Error al eliminar álbum(es):', error);
                alert('Error al eliminar álbum(es).');
            });
    };

    // Función para manejar la generación del enlace de compartir
    const handleShareAlbum = async (albumId) => {
        try {
            const userId = localStorage.getItem('user_id'); // Recuperar el user_id del localStorage
            if (!userId) {
                alert("El usuario no está autenticado.");
                return;
            }

            // Solicitud para generar el enlace de compartir
            const response = await axios.post('http://127.0.0.1:5000/albums/share', {
                album_id: albumId,
                user_id: userId, // Incluir el user_id en la solicitud
            });

            setShareLink(response.data.share_link); // Guardar el enlace generado
            alert('Enlace generado con éxito');
        } catch (error) {
            console.error('Error al generar enlace para compartir:', error);
            alert('Error al generar enlace para compartir el álbum.');
        }
    };

    // Función para alternar la selección de un álbum
    const toggleAlbumSelection = (albumId) => {
        setSelectedAlbums((prevSelected) =>
            prevSelected.includes(albumId)
                ? prevSelected.filter((id) => id !== albumId) // Deseleccionar
                : [...prevSelected, albumId] // Seleccionar
        );
    };

    return (
        <div>
            <Navbar />
            <h2 style={{ textAlign: 'center' }}>Mis Álbumes</h2>
            {loading ? (
                <p style={{ textAlign: 'center' }}>Cargando álbumes...</p>
            ) : albums.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No tienes álbumes creados.</p>
            ) : (
                albums.map((album) => (
                    <div
                        key={album.id}
                        style={{
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #ccc',
                            padding: '10px',
                            borderRadius: '8px',
                        }}
                    >
                        {/* Checkbox para seleccionar el álbum */}
                        <input
                            type="checkbox"
                            checked={selectedAlbums.includes(album.id)}
                            onChange={() => toggleAlbumSelection(album.id)}
                            style={{ marginRight: '10px' }}
                        />
                        <div>
                            {/* Nombre del álbum */}
                            <h3 style={{ margin: '0' }}>{album.name}</h3>
                            {/* Imágenes del álbum */}
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
                            {/* Botón para compartir el álbum */}
                            <button
                                onClick={() => handleShareAlbum(album.id)}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    backgroundColor: '#4CAF50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    marginTop: '10px',
                                    marginRight: '10px',
                                }}
                            >
                                Compartir Álbum
                            </button>
                        </div>
                    </div>
                ))
            )}
            {/* Botón para eliminar álbumes seleccionados */}
            <button
                onClick={handleDeleteAlbums}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >
                Eliminar Álbumes Seleccionados
            </button>
            {/* Mostrar el enlace para compartir si está disponible */}
            {shareLink && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p>Comparte este enlace:</p>
                    <a href={shareLink} target="_blank" rel="noopener noreferrer">
                        {shareLink}
                    </a>
                </div>
            )}
        </div>
    );
}

export default ViewAlbums;
