import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from '../components/Navbar';
import '../style/CreateTimeline.css';

function CreateTimeline() {
    const [timelineName, setTimelineName] = useState("");
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [events, setEvents] = useState([]);
    const userId = useState(localStorage.getItem("user_id"));

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

    const handleAddEvent = () => {
        if (!selectedAlbum) {
            alert("Por favor, selecciona un álbum antes de agregar un evento.");
            return;
        }

        const newEvent = { name: "", date: "", description: "", selectedPhotos: [] };

        // Agrega el nuevo evento al inicio de la lista en lugar del final
        setEvents([newEvent, ...events]);
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
            await axios.post('http://127.0.0.1:5000/timelines/create', timelineData);
            alert("Cronología creada exitosamente");


        } catch (error) {
            console.error("Error al crear la cronología:", error);
            alert("Error al crear la cronología.");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="timeline-container">
                <h2 className="timeline-title">Crear Cronología</h2>
                <div className="timeline-content">
                    <input
                        type="text"
                        value={timelineName}
                        onChange={(e) => setTimelineName(e.target.value)}
                        placeholder="Nombre de la cronología"
                        className="timeline-input"
                    />
                    <div className="album-selection">
                        <label>Selecciona un álbum:</label>
                        <select onChange={(e) => handleAlbumSelection(e.target.value)} className="timeline-select">
                            <option value="">Selecciona un álbum</option>
                            {albums.map((album) => (
                                <option key={album.id} value={album.id}>{album.name}</option>
                            ))}
                        </select>
                    </div>

                    <button onClick={handleAddEvent} className="add-event">
                        + Agregar Evento
                    </button>

                    <button onClick={handleSubmit} className="create-timeline">
                        Crear Cronología
                    </button>

                    {events.map((event, index) => (
                        <div key={index} className="event-card">
                            <input
                                type="text"
                                value={event.name}
                                onChange={(e) => handleEventChange(index, "name", e.target.value)}
                                placeholder="Nombre del evento"
                                className="event-name"
                            />
                            <input
                                type="date"
                                value={event.date}
                                onChange={(e) => handleEventChange(index, "date", e.target.value)}
                                className="event-date"
                            />
                            <textarea
                                value={event.description}
                                onChange={(e) => handleEventChange(index, "description", e.target.value)}
                                placeholder="Descripción del evento"
                                className="event-description"
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

                </div>
            </div>
        </div>
    );
}

export default CreateTimeline;
