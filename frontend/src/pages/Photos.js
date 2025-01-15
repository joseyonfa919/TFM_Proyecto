import React, { useEffect, useState } from 'react'; // Importar React y hooks para manejar estado y efectos
import axios from 'axios'; // Biblioteca para realizar solicitudes HTTP
import Navbar from '../components/Navbar'; // Componente de navegación

// Componente funcional para manejar y mostrar las fotos subidas por el usuario
function Photos() {
    // Estados para manejar las fotos, las fotos seleccionadas y el estado de carga
    const [photos, setPhotos] = useState([]); // Lista de fotos obtenidas del servidor
    const [selectedPhotos, setSelectedPhotos] = useState([]); // Lista de IDs de fotos seleccionadas
    const [loading, setLoading] = useState(true); // Estado de carga para mostrar un indicador

    // Efecto para cargar las fotos del usuario al montar el componente
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const userId = localStorage.getItem('user_id'); // Obtener el user_id desde localStorage
                if (!userId) {
                    alert('No se encontró el ID del usuario en localStorage.');
                    return;
                }

                // Solicitud GET para obtener las fotos del usuario desde el backend
                const response = await axios.get('http://127.0.0.1:5000/photos', {
                    params: { user_id: userId }, // Pasar el user_id como parámetro
                });
                setPhotos(response.data); // Guardar las fotos en el estado
            } catch (error) {
                console.error('Error al obtener las fotos:', error); // Registrar error en consola
                alert('Error al obtener las fotos'); // Notificar al usuario
            } finally {
                setLoading(false); // Finalizar la carga
            }
        };

        fetchPhotos(); // Llamar a la función para obtener las fotos
    }, []); // Se ejecuta solo una vez al montar el componente

    // Función para manejar la eliminación de fotos seleccionadas
    const handleDeletePhotos = async () => {
        const userId = localStorage.getItem('user_id'); // Obtener el user_id desde localStorage
        if (!userId) {
            alert('No se encontró el ID del usuario en localStorage.');
            return;
        }

        if (selectedPhotos.length === 0) {
            alert('Por favor selecciona al menos una foto para eliminar.');
            return;
        }

        try {
            // Solicitud POST para eliminar las fotos seleccionadas
            const response = await axios.post('http://127.0.0.1:5000/photos/delete', {
                user_id: userId,
                photo_ids: selectedPhotos, // Pasar los IDs de las fotos seleccionadas
            });
            alert(response.data.message); // Mostrar mensaje del servidor

            // Actualizar el estado de las fotos eliminando las seleccionadas
            setPhotos((prev) => prev.filter((photo) => !selectedPhotos.includes(photo.id)));
            setSelectedPhotos([]); // Limpiar la selección
        } catch (error) {
            console.error('Error al eliminar fotos:', error); // Registrar error en consola
            alert('Error al eliminar las fotos.'); // Notificar al usuario
        }
    };

    // Función para enviar fotos seleccionadas a la organización por IA
    const handleSendToAI = () => {
        if (selectedPhotos.length === 0) {
            alert("Por favor selecciona al menos una foto.");
            return;
        }
        localStorage.setItem('selected_photos', JSON.stringify(selectedPhotos));
        window.location.href = '/organize-ai';
    };

    return (
        <div>
            <Navbar /> {/* Componente de navegación */}
            <h1 style={{ textAlign: 'center' }}>Tus Fotos Subidas</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                {/* Botón para eliminar fotos seleccionadas */}
                <button
                    onClick={handleDeletePhotos}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#ff4d4d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    Eliminar Fotos Seleccionadas
                </button>


            </div>

            {/* Mostrar mensaje de carga o las fotos */}
            {loading ? (
                <p style={{ textAlign: 'center' }}>Cargando fotos...</p>
            ) : photos.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No tienes fotos cargadas.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {photos.map((photo) => (
                        <div key={photo.id} style={{ margin: '10px', textAlign: 'center' }}>
                            {/* Checkbox para seleccionar/deseleccionar una foto */}
                            <input
                                type="checkbox"
                                value={photo.id}
                                onChange={(e) => {
                                    const photoId = parseInt(e.target.value, 10);
                                    setSelectedPhotos((prev) =>
                                        e.target.checked
                                            ? [...prev, photoId]
                                            : prev.filter((id) => id !== photoId)
                                    );
                                }}
                            />
                            {/* Imagen de vista previa */}
                            <img
                                src={`http://127.0.0.1:5000${photo.file_path}`}
                                alt="Foto subida"
                                style={{ width: '200px', height: 'auto', borderRadius: '10px' }}
                            />
                            <p>Subida el: {new Date(photo.uploaded_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Photos; // Exportar el componente para usarlo en otras partes del proyecto
