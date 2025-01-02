import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Photos() {
    const [photos, setPhotos] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const userId = localStorage.getItem('user_id'); // Obtener el user_id
                if (!userId) {
                    alert('No se encontró el ID del usuario en localStorage.');
                    return;
                }

                const response = await axios.get('http://127.0.0.1:5000/photos', {
                    params: { user_id: userId },
                });
                setPhotos(response.data);
            } catch (error) {
                console.error('Error al obtener las fotos:', error);
                alert('Error al obtener las fotos');
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, []);

    const handleDeletePhotos = async () => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario en localStorage.');
            return;
        }

        if (selectedPhotos.length === 0) {
            alert('Por favor selecciona al menos una foto para eliminar.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/photos/delete', {
                user_id: userId,
                photo_ids: selectedPhotos,
            });
            alert(response.data.message);
            // Actualizar las fotos después de eliminar
            setPhotos((prev) => prev.filter((photo) => !selectedPhotos.includes(photo.id)));
            setSelectedPhotos([]); // Limpiar las fotos seleccionadas
        } catch (error) {
            console.error('Error al eliminar fotos:', error);
            alert('Error al eliminar las fotos.');
        }
    };

    return (
        <div>
            <Navbar />
            <h1 style={{ textAlign: 'center' }}>Tus Fotos Subidas</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
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
                    }}
                >
                    Eliminar Fotos Seleccionadas
                </button>
            </div>
            {loading ? (
                <p style={{ textAlign: 'center' }}>Cargando fotos...</p>
            ) : photos.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No tienes fotos cargadas.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {photos.map((photo) => (
                        <div key={photo.id} style={{ margin: '10px', textAlign: 'center' }}>
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

export default Photos;
