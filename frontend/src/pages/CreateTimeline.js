import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const CreateTimeline = () => {
    const [name, setName] = useState("");
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [events, setEvents] = useState([]);
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            alert("Inicia sesión primero.");
            return;
        }
        axios.get(`http://127.0.0.1:5000/albums?user_id=${userId}`)
            .then(response => setAlbums(response.data))
            .catch(error => console.error("Error al obtener álbumes:", error));
    }, [userId]);

    const handleSelectAlbum = (albumId) => {
        setSelectedAlbum(albumId);
        setEvents([]); // Resetear eventos al cambiar de álbum
    };

    const addEvent = () => {
        setEvents([...events, { photos: [], description: "", date: "" }]);
    };

    const removeEvent = (index) => {
        const updatedEvents = [...events];
        updatedEvents.splice(index, 1);
        setEvents(updatedEvents);
    };

    const handleEventChange = (index, field, value) => {
        const updatedEvents = [...events];
        updatedEvents[index][field] = value;
        setEvents(updatedEvents);
    };

    const handlePhotoSelect = (eventIndex, photoId) => {
        const updatedEvents = [...events];
        if (!updatedEvents[eventIndex]) return;
        
        const eventPhotos = updatedEvents[eventIndex].photos.includes(photoId)
            ? updatedEvents[eventIndex].photos.filter(id => id !== photoId)
            : [...updatedEvents[eventIndex].photos, photoId];
        
        updatedEvents[eventIndex].photos = eventPhotos;
        setEvents(updatedEvents);
    };

    const handleSubmit = async () => {
        if (!name.trim() || events.length === 0) {
            alert("El nombre y al menos un evento son obligatorios.");
            return;
        }

        const timelineData = {
            user_id: userId,
            name,
            album_id: selectedAlbum,
            events,
        };

        try {
            const response = await axios.post("http://127.0.0.1:5000/timelines/create", timelineData);
            alert(response.data.message);
            setName("");
            setEvents([]);
        } catch (error) {
            console.error("Error al crear la cronología:", error);
            alert("Error al crear la cronología.");
        }
    };

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <h2 style={styles.title}>Crear Cronología</h2>
                <input
                    type="text"
                    placeholder="Nombre de la cronología"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                />
                <div>
                    <label>Selecciona un álbum:</label>
                    <select onChange={(e) => handleSelectAlbum(e.target.value)}>
                        <option value="">-- Escoge un álbum --</option>
                        {albums.map(album => (
                            <option key={album.id} value={album.id}>{album.name}</option>
                        ))}
                    </select>
                </div>
                {selectedAlbum && (
                    <div>
                        {events.map((event, eventIndex) => (
                            <div key={eventIndex} style={styles.eventCard}>
                                <h3>Evento {eventIndex + 1}</h3>
                                <input
                                    type="date"
                                    onChange={(e) => handleEventChange(eventIndex, "date", e.target.value)}
                                    style={styles.input}
                                />
                                <textarea
                                    placeholder="Descripción del evento"
                                    onChange={(e) => handleEventChange(eventIndex, "description", e.target.value)}
                                    style={styles.textarea}
                                />
                                <h4>Fotos seleccionadas para este evento:</h4>
                                <div style={styles.photoSelector}>
                                    {event.photos.length > 0 ? (
                                        event.photos.map(photoId => (
                                            <img
                                                key={photoId}
                                                src={`http://127.0.0.1:5000/uploads/${albums.find(album => album.id == selectedAlbum)?.photos.find(p => p.id == photoId)?.file_name}`}
                                                alt="Foto seleccionada"
                                                style={styles.thumbnail}
                                            />
                                        ))
                                    ) : (
                                        <p>No hay fotos seleccionadas</p>
                                    )}
                                </div>
                                <h4>Selecciona fotos para este evento:</h4>
                                <div style={styles.photoSelector}>
                                    {albums.find(album => album.id == selectedAlbum)?.photos.map(photo => (
                                        <div
                                            key={photo.id}
                                            style={{ 
                                                ...styles.photoItem, 
                                                border: event.photos.includes(photo.id) ? "2px solid #007bff" : "none" 
                                            }}
                                            onClick={() => handlePhotoSelect(eventIndex, photo.id)}
                                        >
                                            <img src={`http://127.0.0.1:5000/uploads/${photo.file_name}`} alt={photo.file_name} style={styles.thumbnail} />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => removeEvent(eventIndex)} style={styles.deleteButton}>❌ Eliminar Evento</button>
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={addEvent} style={styles.addButton}>+ Agregar Evento</button>
                <button onClick={handleSubmit} style={styles.submitButton}>Crear Cronología</button>
            </div>
        </div>
    );
};
const styles = {
    container: { textAlign: "center", padding: "20px" },
    title: { color: "#4CAF50" },
    input: { padding: "10px", margin: "10px", width: "60%", borderRadius: "5px", border: "1px solid #ccc" },
    textarea: { padding: "10px", margin: "10px", width: "60%", height: "50px", borderRadius: "5px", border: "1px solid #ccc" },
    addButton: { backgroundColor: "#007bff", color: "white", padding: "10px", margin: "10px", border: "none", borderRadius: "5px", cursor: "pointer" },
    deleteButton: { backgroundColor: "#ff4d4d", color: "white", padding: "8px", margin: "10px", border: "none", borderRadius: "5px", cursor: "pointer" },
    submitButton: { backgroundColor: "#4CAF50", color: "white", padding: "12px 20px", border: "none", borderRadius: "5px", cursor: "pointer" },
    eventCard: { border: "1px solid #ccc", padding: "10px", margin: "10px auto", width: "60%", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "center" },
    photoSelector: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "10px" },
    photoItem: { cursor: "pointer", textAlign: "center", padding: "5px", border: "1px solid #ccc", borderRadius: "5px", width: "120px", backgroundColor: "#f9f9f9" },
    thumbnail: { width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" },
};

export default CreateTimeline;
