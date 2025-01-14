import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ClipLoader } from 'react-spinners';

function CreateAlbum() {
    const [photos, setPhotos] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [manualAlbumName, setManualAlbumName] = useState('');
    const [manualSelectedPhotos, setManualSelectedPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
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

    const handleAutoSuggestAlbums = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario. Por favor inicia sesión nuevamente.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/albums/suggest-auto', {
                user_id: userId,
            });

            setSuggestions(response.data.suggestions);
        } catch (error) {
            console.error('Error al generar sugerencias automáticas:', error);
            alert('Error al generar sugerencias de álbumes.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateManualAlbum = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario. Por favor inicia sesión nuevamente.');
            return;
        }

        if (!manualAlbumName.trim() || manualSelectedPhotos.length === 0) {
            alert('Por favor ingresa un nombre para el álbum y selecciona al menos una foto.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/albums', {
                user_id: userId,
                name: manualAlbumName,
                photo_ids: manualSelectedPhotos,
            });

            alert(`Álbum creado: ${response.data.message}`);
            setManualAlbumName('');
            setManualSelectedPhotos([]);
        } catch (error) {
            console.error('Error al crear el álbum manual:', error);
            alert('Error al crear el álbum manual.');
        }
    };

    const handleCreateSuggestedAlbum = async (suggestion) => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario. Por favor inicia sesión nuevamente.');
            return;
        }

        if (!suggestion.album_name.trim()) {
            alert('Por favor ingresa un nombre para el álbum sugerido.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/albums', {
                user_id: userId,
                name: suggestion.album_name,
                photo_ids: suggestion.photo_ids,
            });

            alert(`Álbum creado: ${response.data.message}`);
            setSuggestions([]);
        } catch (error) {
            console.error('Error al crear el álbum sugerido:', error);
            alert('Error al crear el álbum sugerido.');
        }
    };

    return (
        <div>
            <Navbar />
            <h2 style={{ textAlign: 'center' }}>Crear Álbumes</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                <div style={{ width: '45%' }}>
                    <h3>Crear Álbum Manualmente</h3>
                    <input
                        type="text"
                        placeholder="Nombre del álbum"
                        value={manualAlbumName}
                        onChange={(e) => setManualAlbumName(e.target.value)}
                        style={{
                            padding: '10px',
                            fontSize: '16px',
                            width: '100%',
                            marginBottom: '10px',
                        }}
                    />
                    <h5>Selecciona fotos:</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {photos.map((photo) => (
                            <div key={photo.id} style={{ textAlign: 'center', width: 'calc(25% - 10px)' }}>
                                <img
                                    src={`http://127.0.0.1:5000${photo.file_path}`}
                                    alt={photo.file_name}
                                    style={{ width: '100%', borderRadius: '5px' }}
                                />
                                <p>{photo.file_name}</p>
                                <input
                                    type="checkbox"
                                    checked={manualSelectedPhotos.includes(photo.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setManualSelectedPhotos((prev) => [...prev, photo.id]);
                                        } else {
                                            setManualSelectedPhotos((prev) =>
                                                prev.filter((id) => id !== photo.id)
                                            );
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleCreateManualAlbum}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Crear Álbum Manualmente
                    </button>
                </div>

                <div style={{ width: '45%' }}>
                    <h3>Crear Álbumes con IA</h3>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                            onClick={handleAutoSuggestAlbums}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                backgroundColor: '#6c63ff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Generar Álbumes Automáticos
                        </button>
                    </div>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <ClipLoader color="#007bff" size={50} />
                            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Procesando...</p>
                        </div>
                    ) : (
                        <>
                            {suggestions.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <h3>Sugerencias de Álbumes:</h3>
                                    {suggestions.map((suggestion, index) => (
                                        <div key={index} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px' }}>
                                            <h4>Nombre sugerido:</h4>
                                            <input
                                                type="text"
                                                value={suggestion.album_name}
                                                onChange={(e) => {
                                                    const updatedSuggestions = [...suggestions];
                                                    updatedSuggestions[index].album_name = e.target.value;
                                                    setSuggestions(updatedSuggestions);
                                                }}
                                                style={{
                                                    padding: '10px',
                                                    fontSize: '16px',
                                                    width: '100%',
                                                    marginBottom: '10px',
                                                }}
                                            />
                                            <h5>Fotos sugeridas:</h5>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {suggestion.photos.map((photo) => (
                                                    <div key={photo.id} style={{ textAlign: 'center', width: 'calc(25% - 10px)' }}>
                                                        <img
                                                            src={`http://127.0.0.1:5000${photo.file_path}`}
                                                            alt={photo.file_name}
                                                            style={{ width: '100%', borderRadius: '5px' }}
                                                        />
                                                        <p>{photo.file_name}</p>
                                                        <input
                                                            type="checkbox"
                                                            checked={suggestion.photo_ids.includes(photo.id)}
                                                            onChange={(e) => {
                                                                const updatedSuggestions = [...suggestions];
                                                                if (e.target.checked) {
                                                                    updatedSuggestions[index].photo_ids.push(photo.id);
                                                                } else {
                                                                    updatedSuggestions[index].photo_ids = updatedSuggestions[index].photo_ids.filter(
                                                                        (id) => id !== photo.id
                                                                    );
                                                                }
                                                                setSuggestions(updatedSuggestions);
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleCreateSuggestedAlbum(suggestion)}
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '10px 20px',
                                                    fontSize: '16px',
                                                    backgroundColor: '#28a745',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Crear Álbum
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateAlbum;
