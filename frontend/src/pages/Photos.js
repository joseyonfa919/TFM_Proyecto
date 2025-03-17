import React, { useEffect, useState } from 'react'; // Importa React y los hooks useEffect y useState para manejar estados y efectos
import axios from 'axios'; // Importa Axios para realizar peticiones HTTP al backend
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación
import '../style/Photos.css'; // Importa los estilos CSS específicos para este componente

// =========================== COMPONENTE PRINCIPAL PHOTOS ===========================

function Photos() {
    // Estados para manejar las fotos, fotos seleccionadas, estado de carga y búsqueda
    const [photos, setPhotos] = useState([]); // Estado para almacenar la lista de fotos del usuario
    const [selectedPhotos, setSelectedPhotos] = useState([]); // Estado para almacenar las fotos seleccionadas para eliminación
    const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos
    const [searchQuery, setSearchQuery] = useState(''); // Estado para manejar la búsqueda de fotos

    // =========================== CARGAR LAS FOTOS AL MONTAR EL COMPONENTE ===========================

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const userId = localStorage.getItem('user_id'); // Obtener el ID del usuario desde localStorage
                if (!userId) {
                    alert('No se encontró el ID del usuario en localStorage.'); // Mostrar alerta si no hay usuario
                    return;
                }
                // Hacer solicitud al backend para obtener las fotos del usuario
                const response = await axios.get('http://127.0.0.1:5000/photos', {
                    params: { user_id: userId },
                });
                setPhotos(response.data); // Almacenar las fotos en el estado
            } catch (error) {
                console.error('Error al obtener las fotos:', error);
                alert('Error al obtener las fotos.'); // Mostrar mensaje de error
            } finally {
                setLoading(false); // Indicar que la carga ha finalizado
            }
        };
        fetchPhotos(); // Llamar a la función para obtener las fotos
    }, []);

    // =========================== ELIMINAR FOTOS SELECCIONADAS ===========================

    const handleDeletePhotos = async () => {
        const userId = localStorage.getItem('user_id'); // Obtener el ID del usuario desde localStorage
        if (!userId) {
            alert('No se encontró el ID del usuario en localStorage.'); // Mostrar alerta si no hay usuario
            return;
        }
        if (selectedPhotos.length === 0) {
            alert('Por favor selecciona al menos una foto para eliminar.'); // Validar que haya fotos seleccionadas
            return;
        }
        try {
            // Enviar solicitud al backend para eliminar las fotos seleccionadas
            const response = await axios.post('http://127.0.0.1:5000/photos/delete', {
                user_id: userId,
                photo_ids: selectedPhotos,
            });
            alert(response.data.message); // Mostrar mensaje de éxito
            // Actualizar la lista de fotos eliminando las seleccionadas
            setPhotos((prev) => prev.filter((photo) => !selectedPhotos.includes(photo.id)));
            setSelectedPhotos([]); // Limpiar la selección
        } catch (error) {
            console.error('Error al eliminar fotos:', error);
            alert('Error al eliminar las fotos.'); // Mostrar mensaje de error
        }
    };

    // =========================== FILTRAR FOTOS SEGÚN BÚSQUEDA ===========================

    const filteredPhotos = photos.filter(photo =>
        photo.file_name.toLowerCase().includes(searchQuery.toLowerCase()) // Filtrar fotos por el nombre del archivo
    );

    return (
        <div>
            <Navbar /> {/* Incluir la barra de navegación */}
            <div className="photos-container"> {/* Contenedor principal */}

                <h1 className="title">📷 Tus Fotos Subidas</h1> {/* Título principal */}

                {/* Barra de búsqueda y botón para eliminar fotos */}
                <div className="top-actions">
                    <input
                        type="text"
                        placeholder="🔍 Buscar fotos..."
                        className="search-bar"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="delete-button" onClick={handleDeletePhotos}>🗑️ Eliminar Seleccionadas</button>
                </div>

                {/* Mostrar mensaje mientras se cargan las fotos */}
                {loading ? (
                    <p className="loading-text">Cargando fotos...</p>
                ) : filteredPhotos.length === 0 ? (
                    <p className="loading-text">No se encontraron fotos.</p>
                ) : (
                    <div className="photo-grid">
                        {filteredPhotos.map((file) => (
                            <div key={file.id} className="photo-card">
                                {/* Checkbox para seleccionar un archivo */}
                                <input
                                    type="checkbox"
                                    className="photo-checkbox"
                                    value={file.id}
                                    onChange={(e) => {
                                        const fileId = parseInt(e.target.value, 10);
                                        setSelectedPhotos((prev) =>
                                            e.target.checked
                                                ? [...prev, fileId] // Agregar a la lista de seleccionados
                                                : prev.filter((id) => id !== fileId) // Quitar de la lista si se desmarca
                                        );
                                    }}
                                />

                                {/* Verificar si es imagen o video */}
                                <div className="photo-media-container">
                                    {file.file_name.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                        <img src={`http://127.0.0.1:5000${file.file_path}`} alt="Imagen subida" className="photo-image" />
                                    ) : file.file_name.match(/\.(mp4|webm|ogg)$/i) ? (
                                        <video className="photo-video" controls>
                                            <source src={`http://127.0.0.1:5000${file.file_path}`} type="video/mp4" />
                                            Tu navegador no soporta videos.
                                        </video>
                                    ) : (
                                        <p>Archivo no soportado</p>
                                    )}
                                </div>

                                {/* Mostrar la fecha de subida */}
                                <p className="photo-date">📅 {new Date(file.uploaded_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Photos; // Exportar el componente para su uso en la aplicación
