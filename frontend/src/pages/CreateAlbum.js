import React, { useState, useEffect } from 'react'; // Importa React y los hooks useState y useEffect
import axios from 'axios'; // Importa Axios para hacer peticiones HTTP al backend
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la barra de navegación
import { ClipLoader } from 'react-spinners'; // Importa un spinner de carga
import '../style/CreateAlbum.css'; // Importa los estilos CSS para el componente

function CreateAlbum() {
    // Estados para manejar las fotos, sugerencias de IA, nombre del álbum y fotos seleccionadas
    const [photos, setPhotos] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [albumName, setAlbumName] = useState('');
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [albumNames, setAlbumNames] = useState({});

    // Obtener las fotos del usuario al cargar el componente
    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error('No se encontró user_id en localStorage');
            return;
        }

        axios
            .get('http://127.0.0.1:5000/photos', { params: { user_id: userId } })
            .then((response) => {
                setPhotos(response.data); // Guardar las fotos en el estado
            })
            .catch((error) => {
                console.error('Error al obtener las fotos:', error);
            });
    }, []);

    // Filtrar fotos según la consulta de búsqueda
    const filteredPhotos = photos.filter(photo =>
        photo.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // =========================== CREAR ÁLBUM MANUALMENTE ===========================

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

    const handleAlbumNameChange = (index, newName) => {
        setAlbumNames(prevNames => ({
            ...prevNames,
            [index]: newName,  // Solo cambia el nombre del álbum sin afectar `suggestions`
        }));
    };
    // =========================== SELECCIÓN DE FOTOS ===========================

    const handlePhotoSelection = (photoId) => {
        setSelectedPhotos((prevSelected) => {
            if (prevSelected.includes(photoId)) {
                return prevSelected.filter((id) => id !== photoId);
            } else {
                return [...prevSelected, photoId];
            }
        });
    };

    // =========================== CREAR ÁLBUM BASADO EN SUGERENCIAS DE IA ===========================

    const handleCreateSuggestedAlbum = async (index) => {
        const userId = localStorage.getItem('user_id');
    
        if (!userId) {
            alert('No se encontró el ID del usuario. Inicia sesión nuevamente.');
            return;
        }
    
        // ✅ Obtener la sugerencia correspondiente
        const suggestion = suggestions[index];
    
        if (!suggestion) {
            alert('Error: No se encontró la sugerencia de álbum.');
            return;
        }
    
        // ✅ Obtener el nombre ingresado por el usuario o usar el nombre generado
        const albumName = albumNames[index] || suggestion.album_name || `Álbum ${index + 1}`;
    
        if (!albumName.trim()) {
            alert('Por favor, ingresa un nombre para el álbum.');
            return;
        }
    
        try {
            await axios.post('http://127.0.0.1:5000/albums', {
                user_id: userId,
                name: albumName,  // ✅ Enviar el nombre correcto
                photo_ids: suggestion.photo_ids || [], // ✅ Evita errores si no hay fotos
            });
    
            alert(`Álbum "${albumName}" creado con éxito.`);
    
            // ✅ Mantener las sugerencias pero eliminar solo la usada
            setSuggestions(prevSuggestions => prevSuggestions.filter((_, i) => i !== index));
    
            // ✅ Eliminar solo el nombre del álbum creado, no todos
            setAlbumNames(prevNames => {
                const newNames = { ...prevNames };
                delete newNames[index];
                return newNames;
            });
    
        } catch (error) {
            console.error('Error al crear el álbum sugerido:', error);
            alert('Error al crear el álbum.');
        }
    };
    

    // =========================== GENERAR SUGERENCIAS DE ÁLBUMES AUTOMÁTICOS ===========================

    const handleAutoSuggestAlbums = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario. Por favor inicia sesión nuevamente.');
            return;
        }

        setIsLoading(true);
        console.log("📡 Enviando solicitud a la API para generar sugerencias...");

        try {
            const response = await axios.post('http://127.0.0.1:5000/albums/suggest-auto', {
                user_id: userId,
            });

            console.log("✅ Respuesta de la API recibida:", response.data);

            if (response.data && Array.isArray(response.data.suggestions)) {
                setSuggestions(response.data.suggestions);
            } else {
                console.error("⚠️ La API no devolvió un array válido de sugerencias:", response.data);
                setSuggestions([]);
            }
        } catch (error) {
            console.error("❌ Error al generar sugerencias automáticas:", error);
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

                    {/* Sección para crear álbum manualmente */}
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
                            {filteredPhotos.map((file) => (
                                <div key={file.id} className="photo-card">
                                    {/* Checkbox para seleccionar archivos */}
                                    <input
                                        type="checkbox"
                                        className="photo-checkbox"
                                        checked={selectedPhotos.includes(file.id)}
                                        onChange={() => handlePhotoSelection(file.id)}
                                    />
                                    {/* Mostrar imagen o video */}
                                    {file.file_name.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                        <img src={`http://127.0.0.1:5000/uploads/${file.file_name}`} alt="Imagen subida" className="photo-media" />
                                    ) : file.file_name.match(/\.(mp4|webm|ogg)$/i) ? (
                                        <video className="photo-media" controls>
                                            <source src={`http://127.0.0.1:5000/uploads/${file.file_name}`} type="video/mp4" />
                                            Tu navegador no soporta videos.
                                        </video>
                                    ) : (
                                        <p>Archivo no soportado</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="btn-album" onClick={handleCreateManualAlbum}>📂 Crear Álbum Manualmente</button>
                    </div>

                    {/* Sección para crear álbum con IA */}
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
                                {suggestions && suggestions.length > 0 ? (
                                    suggestions.map((suggestion, index) => (
                                        <div key={`${suggestion.album_name}-${index}`} className="suggestion-card">
                                            <input
                                                type="text"
                                                value={albumNames[index] !== undefined ? albumNames[index] : suggestions[index]?.album_name || ""}
                                                className="album-input"
                                                onChange={(e) => handleAlbumNameChange(index, e.target.value)}
                                                onFocus={(e) => e.target.select()} // Mantiene el foco en el input
                                                onClick={(e) => e.stopPropagation()} // Evita perder el foco accidentalmente
                                            />
                                            <div className="photo-grid">
                                                {suggestion.photos?.map((photo, i) => (
                                                    <div key={`${photo.file_name}-${i}`} className="photo-card">
                                                        {photo.type === "image" ? (
                                                            <img src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
                                                                alt={photo.file_name} className="photo-image" />
                                                        ) : (
                                                            <video className="photo-video" controls>
                                                                <source src={`http://127.0.0.1:5000/uploads/${photo.file_name}`} type="video/mp4" />
                                                                Tu navegador no soporta videos.
                                                            </video>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="btn-album" onClick={() => handleCreateSuggestedAlbum(index)}>📂 Crear Álbum</button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay sugerencias disponibles.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateAlbum;
