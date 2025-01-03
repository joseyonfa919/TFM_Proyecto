import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function CreateAlbum() {
    const [photos, setPhotos] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [albumName, setAlbumName] = useState('');

    useEffect(() => {
        const userId = localStorage.getItem('user_id'); // Obtener user_id del localStorage
        if (!userId) {
            console.error('No se encontró user_id en localStorage');
            return;
        }

        axios
            .get('http://127.0.0.1:5000/photos', { params: { user_id: userId } })
            .then((response) => {
                setPhotos(response.data);
            })
            .catch((error) => {
                console.error('Error al obtener las fotos:', error);
            });
    }, []);

    const handleCreateAlbum = async () => {
        const userId = localStorage.getItem('user_id');
        if (!albumName.trim()) {
            alert('Por favor ingresa un nombre para el álbum.');
            return;
        }

        if (selectedPhotos.length === 0) {
            alert('Por favor selecciona al menos una foto para el álbum.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/albums', {
                user_id: userId,
                name: albumName,
                photo_ids: selectedPhotos,
            });
            alert(response.data.message);
            // Reiniciar formulario
            setAlbumName('');
            setSelectedPhotos([]);
        } catch (error) {
            console.error('Error al crear el álbum:', error);
            alert('Error al crear el álbum.');
        }
    };

    return (
        <div>
            <Navbar />
            <h2 style={{ textAlign: 'center' }}>Crear un Álbum</h2>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Nombre del álbum"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    style={{
                        padding: '10px',
                        fontSize: '16px',
                        width: '50%',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        boxSizing: 'border-box',
                    }}
                />
            </div>
            <div>
                <h3 style={{ textAlign: 'left' }}>Selecciona fotos:</h3>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px', // Espaciado uniforme entre elementos
                        justifyContent: 'center', // Asegurar que los elementos estén centrados
                    }}
                >
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            style={{
                                marginBottom: '20px',
                                textAlign: 'center',
                                width: 'calc(25% - 10px)', // Mantener el ancho uniforme
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                padding: '10px',
                                boxSizing: 'border-box',
                            }}
                        >
                            <input
                                type="checkbox"
                                value={photo.id}
                                checked={selectedPhotos.includes(photo.id)}
                                onChange={(e) => {
                                    const photoId = parseInt(e.target.value, 10);
                                    setSelectedPhotos((prev) =>
                                        e.target.checked
                                            ? [...prev, photoId]
                                            : prev.filter((id) => id !== photoId)
                                    );
                                }}
                            />
                            <img
                                src={`http://127.0.0.1:5000${photo.file_path}`}
                                alt="Foto"
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '5px',
                                    marginTop: '10px',
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button
                    onClick={handleCreateAlbum}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Crear Álbum
                </button>
            </div>
        </div>
    );
}

export default CreateAlbum;
