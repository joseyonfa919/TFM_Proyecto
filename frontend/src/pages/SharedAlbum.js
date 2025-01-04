import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Componente para mostrar un álbum compartido basado en un token único
function SharedAlbum({ match }) {
    // Estado para almacenar los datos del álbum compartido
    const [album, setAlbum] = useState(null);

    // Efecto que se ejecuta cuando el componente se monta o cuando cambia el token
    useEffect(() => {
        // Función para obtener los datos del álbum compartido
        const fetchSharedAlbum = async () => {
            const token = match.params.token; // Obtener el token desde los parámetros de la URL
            try {
                // Solicitud GET al backend para obtener los datos del álbum
                const response = await axios.get(`http://127.0.0.1:5000/shared/${token}`);
                setAlbum(response.data); // Guardar los datos del álbum en el estado
            } catch (error) {
                console.error('Error al cargar el álbum compartido:', error);
            }
        };

        fetchSharedAlbum(); // Llamar a la función para obtener los datos
    }, [match.params.token]); // Dependencia: se vuelve a ejecutar si cambia el token

    // Mostrar un mensaje de carga mientras se obtienen los datos del álbum
    if (!album) {
        return <p>Cargando álbum compartido...</p>;
    }

    return (
        <div>
            {/* Mostrar el nombre del álbum */}
            <h2>{album.name}</h2>
            {/* Mostrar las fotos del álbum en un contenedor flexible */}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {album.photos.map((photo) => (
                    <img
                        key={photo.id} // Clave única para cada foto
                        src={`http://127.0.0.1:5000/uploads/${photo.file_path}`} // Ruta de la foto
                        alt={photo.file_name} // Nombre alternativo para accesibilidad
                        style={{
                            width: '100px', // Ancho de la foto
                            height: '100px', // Altura de la foto
                            margin: '5px', // Espaciado entre fotos
                            objectFit: 'cover', // Ajuste para que las fotos se vean bien
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default SharedAlbum;
