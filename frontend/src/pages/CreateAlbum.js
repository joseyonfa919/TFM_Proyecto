import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ClipLoader } from 'react-spinners';
import '../style/CreateAlbum.css';

function CreateAlbum() {
    const [photos, setPhotos] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [albumName, setAlbumName] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredPhotos = photos.filter(photo =>
        photo.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateManualAlbum = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario. Inicia sesión nuevamente.');
            return;
        }

        if (!albumName.trim()) {
            alert('Por favor ingresa un nombre para el álbum.');
            return;
        }

        if (selectedPhotos.length === 0) {
            alert('Selecciona al menos una foto para el álbum.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/albums', {
                user_id: userId,
                name: albumName,
                photo_ids: selectedPhotos,
            });
            alert(`Álbum creado: ${response.data.message}`);
            setAlbumName('');
            setSelectedPhotos([]);
        } catch (error) {
            console.error('Error al crear el álbum:', error);
            alert('Error al crear el álbum.');
        }
    };

    const handlePhotoSelection = (photoId) => {
        setSelectedPhotos((prevSelected) => {
            if (prevSelected.includes(photoId)) {
                return prevSelected.filter((id) => id !== photoId);
            } else {
                return [...prevSelected, photoId];
            }
        });
    };

    const handleCreateSuggestedAlbum = async (index) => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario. Inicia sesión nuevamente.');
            return;
        }
    
        const suggestion = suggestions[index]; // Obtener la sugerencia correspondiente
    
        try {
                await axios.post('http://127.0.0.1:5000/albums', {
                user_id: userId,
                name: suggestion.album_name,
                photo_ids: suggestion.photo_ids, // Lista de IDs de las fotos
            });
    
            alert(`Álbum "${suggestion.album_name}" creado con éxito.`);

            setSuggestions([]);
            setAlbumName('');
        } catch (error) {
            console.error('Error al crear el álbum sugerido:', error);
            alert('Error al crear el álbum.');
        }
    };
    

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

    return (
        <div>
            <Navbar />
            <div className="album-container">

                <div className="album-sections">
                    <div className="album-manual">
                        <h2 style={{ color: 'black' }}> 📂 Crear Álbum Manualmente</h2>
                        <input
                            type="text"
                            value={albumName}
                            onChange={(e) => setAlbumName(e.target.value)}
                            placeholder="Escribe el nombre de tu álbum..."
                            className="album-input"
                        />
                        <input
                            type="text"
                            placeholder="🔍 Buscar fotos..."
                            className="search-bar"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="photo-grid">
                            {filteredPhotos.map((photo) => (
                                <div key={photo.id} className="photo-card">
                                    <img src={`http://127.0.0.1:5000/uploads/${photo.file_name}`} alt={photo.file_name} className="photo-image" />
                                    <input
                                        type="checkbox"
                                        className="photo-checkbox"
                                        checked={selectedPhotos.includes(photo.id)}
                                        onChange={() => handlePhotoSelection(photo.id)}
                                    />
                                </div>
                            ))}
                        </div>
                        <button className="btn-album" onClick={handleCreateManualAlbum}>📂 Crear Álbum Manualmente</button>
                    </div>

                    <div className="album-ai">
                        <h2 style={{ color: 'black' }}>🤖 Crear Álbumes con IA</h2>
                        <button className="btn-ai" onClick={handleAutoSuggestAlbums}>⚡ Generar Álbumes Automáticos</button>

                        {isLoading ? (
                            <div className="loading-container">
                                <ClipLoader color="#007bff" size={50} />
                                <p>Procesando...</p>
                            </div>
                        ) : (
                            <div className="suggestions-container">
                                {suggestions.map((suggestion, index) => (
                                    <div key={index} className="suggestion-card">
                                        <input
                                            type="text"
                                            value={suggestion.album_name}
                                            className="album-input"
                                            onChange={(e) => {
                                                const updatedSuggestions = [...suggestions];
                                                updatedSuggestions[index].album_name = e.target.value;
                                                setSuggestions(updatedSuggestions);
                                            }}
                                        />
                                        <div className="photo-grid">
                                            {suggestion.photos.map((photo) => (
                                                <div key={photo.id} className="photo-card">
                                                    <img src={`http://127.0.0.1:5000/uploads/${photo.file_name}`} alt={photo.file_name} className="photo-image" />
                                                </div>
                                            ))}
                                        </div>
                                        <button className="btn-album" onClick={() => handleCreateSuggestedAlbum(index)}>📂 Crear Álbum</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateAlbum;
