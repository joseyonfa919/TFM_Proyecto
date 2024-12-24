import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Photos() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true); // Estado para indicar que está cargando
    const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/photos', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Enviar el token como encabezado
                    },
                });
                setPhotos(response.data);
            } catch (error) {
                console.error('Error al obtener las fotos:', error);
                alert('Error al obtener las fotos');
            } finally {
                setLoading(false); // Detener la carga independientemente del resultado
            }
        };

        fetchPhotos();
    }, []);

    return (
        <div>
            <Navbar />
            <h1 style={{ textAlign: 'center' }}>Tus Fotos Subidas</h1>
            {loading ? (
                <p style={{ textAlign: 'center' }}>Cargando fotos...</p>
            ) : photos.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No tienes fotos cargadas.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {photos.map((photo) => (
                        <div key={photo.id} style={{ margin: '10px', textAlign: 'center' }}>
                            <img
                                src={`http://127.0.0.1:5000/uploads/${photo.file_path}`}
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

export default Photos;
