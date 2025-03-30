import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../style/MultimodalInteraction.css';

// Componente para mostrar un álbum compartido basado en un token único
function SharedAlbum({ match }) {
    // Estado para almacenar los datos del álbum compartido
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    //const { id } = useParams();
    const { token } = useParams();



    // Efecto que se ejecuta cuando el componente se monta o cuando cambia el token
    useEffect(() => {
        const fetchSharedAlbum = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/shared/${token}`);  
                setAlbum(response.data);
            } catch (error) {
                console.error('Error al cargar el álbum compartido:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSharedAlbum();
    }, [token]);

    if (loading) {
        return <div className="spinner"></div>;
    }

    if (!album) {
        return <p>No se pudo cargar el álbum compartido.</p>;
    }

    return (
        <div>
            <h2>{album.name}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {album.photos.map((photo) => (
                    <img
                        key={photo.id}
                        src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
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
        </div>
    );
}

export default SharedAlbum;