import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from '../components/Navbar';
import { useNavigate } from "react-router-dom";
import '../style/CreateAlbum.css';

function CreateTimeline() {
    const [timelineName, setTimelineName] = useState("");
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [events, setEvents] = useState([]);
    const [userId, setUserId] = useState(localStorage.getItem("user_id"));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/albums", {
                    params: { user_id: userId },
                });
                setAlbums(response.data);
            } catch (error) {
                console.error("Error al obtener los álbumes:", error);
            }
        };

        fetchAlbums();
    }, [userId]);

    const handleAlbumSelection = (albumId) => {
        setSelectedAlbum(albumId);
    };

    const handleAddEvent = () => {
        setEvents([...events, { date: "", description: "", selectedPhotos: [] }]);
    };

    const handleRemoveEvent = (index) => {
        const updatedEvents = [...events];
        updatedEvents.splice(index, 1);
        setEvents(updatedEvents);
    };

    const handleEventChange = (index, field, value) => {
        const updatedEvents = [...events];
        updatedEvents[index][field] = value;
        setEvents(updatedEvents);
    };

    const handlePhotoSelection = (eventIndex, photo) => {
        const updatedEvents = [...events];
        const selectedPhotos = updatedEvents[eventIndex].selectedPhotos || [];
        const isSelected = selectedPhotos.some((p) => p.id === photo.id);

        if (isSelected) {
            updatedEvents[eventIndex].selectedPhotos = selectedPhotos.filter((p) => p.id !== photo.id);
        } else {
            updatedEvents[eventIndex].selectedPhotos = [...selectedPhotos, photo];
        }

        setEvents(updatedEvents);
    };

    const handleSubmit = async () => {
        const timelineData = {
            name: timelineName,
            user_id: userId,
            events: events.map(event => ({
                date: event.date,
                description: event.description,
                photo_ids: event.selectedPhotos.map(photo => photo.id) // Asegurar que se envían como lista
            }))
        };
    
        try {
            const response = await axios.post('http://127.0.0.1:5000/timelines/create', timelineData);
            alert("Cronología creada exitosamente");
        } catch (error) {
            console.error("Error al crear la cronología:", error);
            alert("Error al crear la cronología.");
        }
    };

    return (
        <div>
            <Navbar />
            <div style={{ padding: "20px" }}>
                <h2 style={{ textAlign: "center", color: "black" }}>Crear Cronología</h2>

                <input
                    type="text"
                    value={timelineName}
                    onChange={(e) => setTimelineName(e.target.value)}
                    placeholder="Nombre de la cronología"
                    style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />

                <div style={{ marginBottom: "20px" }}>
                    <label>Selecciona un álbum:</label>
                    <select onChange={(e) => handleAlbumSelection(e.target.value)} style={{ width: "100%", padding: "10px" }}>
                        <option value="">Selecciona un álbum</option>
                        {albums.map((album) => (
                            <option key={album.id} value={album.id}>
                                {album.name}
                            </option>
                        ))}
                    </select>
                </div>

                

                {events.map((event, index) => (
                    <div key={index} style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "5px" }}>
                        <h3>Evento {index + 1}</h3>
                        <input
                            type="date"
                            value={event.date}
                            onChange={(e) => handleEventChange(index, "date", e.target.value)}
                            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                        />
                        <textarea
                            value={event.description}
                            onChange={(e) => handleEventChange(index, "description", e.target.value)}
                            placeholder="Descripción del evento"
                            style={{ width: "100%", padding: "10px", height: "60px", marginBottom: "10px" }}
                        />

                        <h4>Fotos seleccionadas para este evento:</h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {event.selectedPhotos.map((photo) => (
                                <img
                                    key={photo.id}
                                    src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
                                    alt={photo.file_name}
                                    style={{ width: "100px", height: "100px", border: "2px solid green" }}
                                />
                            ))}
                        </div>

                        <h4>Selecciona fotos para este evento:</h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {albums
                                .find((album) => album.id.toString() === selectedAlbum.toString())
                                ?.photos.map((photo) => (
                                    <img
                                        key={photo.id}
                                        src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
                                        alt={photo.file_name}
                                        style={{ width: "100px", height: "100px", cursor: "pointer", border: "2px solid #ccc" }}
                                        onClick={() => handlePhotoSelection(index, photo)}
                                    />
                                ))}
                        </div>

                        <button
                            onClick={() => handleRemoveEvent(index)}
                            style={{ backgroundColor: "red", color: "white", padding: "10px", borderRadius: "5px", marginTop: "10px" }}
                        >
                            Eliminar Evento
                        </button>
                    </div>
                ))}

                <button onClick={handleAddEvent} style={{ backgroundColor: "#007bff", color: "white", padding: "10px", borderRadius: "5px", marginTop: "20px" }}>
                    + Agregar Evento
                </button>

                <button onClick={handleSubmit} style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", borderRadius: "5px", marginTop: "20px" }}>
                    Crear Cronología
                </button>
            </div>
        </div>
    );
}

export default CreateTimeline;
