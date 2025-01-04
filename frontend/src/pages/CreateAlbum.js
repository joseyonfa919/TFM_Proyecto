import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Componente de navegación

function CreateAlbum() {
    // Estados para manejar las fotos disponibles, las fotos seleccionadas y el nombre del álbum
    const [photos, setPhotos] = useState([]); // Lista de fotos disponibles
    const [selectedPhotos, setSelectedPhotos] = useState([]); // Lista de fotos seleccionadas para el álbum
    const [albumName, setAlbumName] = useState(''); // Nombre del álbum

    // Efecto para cargar las fotos disponibles al montar el componente
    useEffect(() => {
        const userId = localStorage.getItem('user_id'); // Obtener el user_id desde localStorage
        if (!userId) {
            console.error('No se encontró user_id en localStorage');
            return;
        }

        // Solicitud para obtener las fotos del usuario
        axios
            .get('http://127.0.0.1:5000/photos', { params: { user_id: userId } })
            .then((response) => {
                setPhotos(response.data); // Guardar las fotos en el estado
            })
            .catch((error) => {
                console.error('Error al obtener las fotos:', error);
            });
    }, []);

    // Función para manejar la creación de un álbum
    const handleCreateAlbum = async () => {
        const userId = localStorage.getItem('user_id'); // Obtener el user_id desde localStorage

        // Validar que el nombre del álbum no esté vacío
        if (!albumName.trim()) {
            alert('Por favor ingresa un nombre para el álbum.');
            return;
        }

        // Validar que se haya seleccionado al menos una foto
        if (selectedPhotos.length === 0) {
            alert('Por favor selecciona al menos una foto para el álbum.');
            return;
        }

        try {
            // Enviar solicitud POST para crear el álbum
            const response = await axios.post('http://127.0.0.1:5000/albums', {
                user_id: userId,
                name: albumName, // Nombre del álbum
                photo_ids: selectedPhotos, // IDs de las fotos seleccionadas
            });
            alert(response.data.message); // Mostrar mensaje del servidor
            // Reiniciar el formulario
            setAlbumName('');
            setSelectedPhotos([]);
        } catch (error) {
            console.error('Error al crear el álbum:', error);
            alert('Error al crear el álbum.');
        }
    };

    return (
        <div>
            <Navbar /> {/* Componente de navegación */}
            <h2 style={{ textAlign: 'center' }}>Crear un Álbum</h2>
            {/* Campo para ingresar el nombre del álbum */}
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
            {/* Lista de fotos disponibles para selección */}
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
                            key={photo.id} // Identificador único para cada foto
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
                            {/* Checkbox para seleccionar/deseleccionar una foto */}
                            <input
                                type="checkbox"
                                value={photo.id}
                                checked={selectedPhotos.includes(photo.id)}
                                onChange={(e) => {
                                    const photoId = parseInt(e.target.value, 10);
                                    setSelectedPhotos((prev) =>
                                        e.target.checked
                                            ? [...prev, photoId] // Agregar foto seleccionada
                                            : prev.filter((id) => id !== photoId) // Remover foto seleccionada
                                    );
                                }}
                            />
                            {/* Imagen de vista previa */}
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
            {/* Botón para crear el álbum */}
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
