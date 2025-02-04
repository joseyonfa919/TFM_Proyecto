import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../style/Timeline.css";

const Timeline = () => {
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [timelineName, setTimelineName] = useState("");
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            alert("Inicia sesión primero.");
            return;
        }
        axios.get(`http://127.0.0.1:5000/albums?user_id=${userId}`)
            .then(response => {
                setAlbums(response.data.albums);
            })
            .catch(error => {
                console.error("Error al obtener álbumes:", error);
            });
    }, [userId]);

    const handleSelectAlbum = (albumId) => {
        setSelectedAlbum(albumId);
        axios.get(`http://127.0.0.1:5000/photos?album_id=${albumId}`)
            .then(response => {
                setPhotos(response.data.photos);
            })
            .catch(error => {
                console.error("Error al obtener fotos:", error);
            });
    };

    const handleCreateTimeline = () => {
        if (!timelineName || !selectedAlbum) {
            alert("Debes ingresar un nombre y seleccionar un álbum.");
            return;
        }
        axios.post(`http://127.0.0.1:5000/timelines/create`, {
            user_id: userId,
            album_id: selectedAlbum,
            name: timelineName
        }).then(response => {
            alert("Cronología creada exitosamente");
            setTimelineName("");
            setSelectedAlbum(null);
            setPhotos([]);
        }).catch(error => {
            console.error("Error al crear cronología:", error);
        });
    };

    return (
        <div>
            <Navbar />
            <div className="timeline-container">
                <h2 className="title">Crear Cronología</h2>
                <input
                    type="text"
                    placeholder="Nombre de la cronología"
                    value={timelineName}
                    onChange={(e) => setTimelineName(e.target.value)}
                    className="input-field"
                />
                <h3>Selecciona un álbum:</h3>
                <div className="album-container">
                    {albums.map((album) => (
                        <button
                            key={album.id}
                            onClick={() => handleSelectAlbum(album.id)}
                            className={selectedAlbum === album.id ? "btn-selected" : "btn-main"}
                        >
                            {album.name}
                        </button>
                    ))}
                </div>
                {photos.length > 0 && (
                    <div>
                        <h3>Fotos del Álbum:</h3>
                        <div className="photo-grid">
                            {photos.map((photo) => (
                                <img
                                    key={photo.id}
                                    src={`http://127.0.0.1:5000${photo.path}`}
                                    alt={photo.file_name}
                                    className="photo-preview"
                                />
                            ))}
                        </div>
                        <button onClick={handleCreateTimeline} className="btn-main">
                            Crear Cronología
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timeline;
