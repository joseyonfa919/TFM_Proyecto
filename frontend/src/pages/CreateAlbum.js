import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ClipLoader } from 'react-spinners';

function CreateAlbum() {
    const [photos, setPhotos] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px' }}>
                <div style={{ width: '48%' }}>
                    <h2 style={{ textAlign: 'center', color: '#4CAF50' }}>Crear Álbum Manualmente</h2>
                    <input
                        type="text"
                        placeholder="Nombre del álbum"
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        {photos.map((photo) => (
                            <div key={photo.id} style={{ width: 'calc(25% - 10px)', textAlign: 'center' }}>
                                <img
                                    src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
                                    alt={photo.file_name}
                                    style={{ width: '100%', borderRadius: '5px' }}
                                />
                                <input type="checkbox" />
                            </div>
                        ))}
                    </div>
                    <button
                        style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Crear Álbum Manualmente
                    </button>
                </div>

                <div style={{ width: '48%' }}>
                    <h2 style={{ textAlign: 'center', color: '#4CAF50' }}>Crear Álbumes con IA</h2>
                    <button
                        onClick={handleAutoSuggestAlbums}
                        style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
                    >
                        Generar Álbumes Automáticos
                    </button>

                    {isLoading ? (
                        <div style={{ textAlign: 'center' }}>
                            <ClipLoader color="#007bff" size={50} />
                            <p>Procesando...</p>
                        </div>
                    ) : (
                        <div>
                            {suggestions.map((suggestion, index) => (
                                <div key={index} style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        value={suggestion.album_name}
                                        onChange={(e) => {
                                            const updatedSuggestions = [...suggestions];
                                            updatedSuggestions[index].album_name = e.target.value;
                                            setSuggestions(updatedSuggestions);
                                        }}
                                        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                                    />
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {suggestion.photos.map((photo) => (
                                            <div key={photo.id} style={{ width: 'calc(25% - 10px)', textAlign: 'center' }}>
                                                <img
                                                    src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
                                                    alt={photo.file_name}
                                                    style={{ width: '100%', borderRadius: '5px' }}
                                                />
                                                <input
                                                    type="checkbox"
                                                    checked={suggestion.photo_ids.includes(photo.id)}
                                                    onChange={(e) => {
                                                        const updatedSuggestions = [...suggestions];
                                                        if (e.target.checked) {
                                                            updatedSuggestions[index].photo_ids.push(photo.id);
                                                        } else {
                                                            updatedSuggestions[index].photo_ids = updatedSuggestions[index].photo_ids.filter((id) => id !== photo.id);
                                                        }
                                                        setSuggestions(updatedSuggestions);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleCreateSuggestedAlbum(suggestion)}
                                        style={{ marginTop: '10px', width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Crear Álbum
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateAlbum;
