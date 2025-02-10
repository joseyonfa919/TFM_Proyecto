import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../style/Photos.css';

function Photos() {
    const [photos, setPhotos] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const userId = localStorage.getItem('user_id');
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
            setPhotos((prev) => prev.filter((photo) => !selectedPhotos.includes(photo.id)));
            setSelectedPhotos([]);
        } catch (error) {
            console.error('Error al eliminar fotos:', error);
            alert('Error al eliminar las fotos.');
        }
    };

    const filteredPhotos = photos.filter(photo =>
        photo.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <Navbar />
            <div className="photos-container">

                <h1 className="title">📷 Tus Fotos Subidas</h1>
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
                {loading ? (
                    <p className="loading-text">Cargando fotos...</p>
                ) : filteredPhotos.length === 0 ? (
                    <p className="loading-text">No se encontraron fotos.</p>
                ) : (
                    <div className="photo-grid">
                        {filteredPhotos.map((photo) => (
                            <div key={photo.id} className="photo-card">
                                <input
                                    type="checkbox"
                                    className="photo-checkbox"
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
                                <img src={`http://127.0.0.1:5000${photo.file_path}`} alt="Foto subida" className="photo-image" />
                                <p className="photo-date">📅 {new Date(photo.uploaded_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Photos;
