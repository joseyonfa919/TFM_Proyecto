import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const CreateTimeline = () => {
    const [name, setName] = useState(""); // Nombre de la cronología
    const [photos, setPhotos] = useState([]); // Lista de fotos del usuario
    const [events, setEvents] = useState([]); // Lista de eventos agregados
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            alert("Inicia sesión primero.");
            return;
        }
        // Obtener las fotos del usuario
        axios.get(`http://127.0.0.1:5000/photos?user_id=${userId}`)
            .then(response => setPhotos(response.data))
            .catch(error => console.error("Error al obtener fotos:", error));
    }, [userId]);

    // Agregar un evento a la cronología
    const addEvent = () => {
        setEvents([...events, { photo_id: "", description: "", date: "" }]);
    };

    // Eliminar un evento específico
    const removeEvent = (index) => {
        const updatedEvents = [...events];
        updatedEvents.splice(index, 1);
        setEvents(updatedEvents);
    };

    // Manejar cambios en los eventos
    const handleEventChange = (index, field, value) => {
        const updatedEvents = [...events];
        updatedEvents[index][field] = value;
        setEvents(updatedEvents);
    };

    // Manejar la selección de fotos en formato miniatura
    const handlePhotoSelect = (index, photoId) => {
        const updatedEvents = [...events];
        updatedEvents[index]["photo_id"] = photoId;
        setEvents(updatedEvents);
    };

    // Enviar la cronología al backend
    const handleSubmit = async () => {
        if (!name.trim() || events.length === 0) {
            alert("El nombre y al menos un evento son obligatorios.");
            return;
        }

        const timelineData = {
            user_id: userId,
            name,
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
            <div style={{ textAlign: "center", padding: "20px" }}>
                <h2 style={{ color: "#4CAF50" }}>Crear Cronología</h2>
                <input
                    type="text"
                    placeholder="Nombre de la cronología"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                />
                <button onClick={addEvent} style={styles.addButton}>
                    + Agregar Evento
                </button>

                {/* Listado de eventos */}
                {events.map((event, index) => (
                    <div key={index} style={styles.eventCard}>
                        <p><strong>Selecciona una foto:</strong></p>

                        {/* 📌 Galería de imágenes para seleccionar */}
                        <div style={styles.photoSelector}>
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    style={{
                                        ...styles.photoItem,
                                        border: event.photo_id === photo.id ? "3px solid #007bff" : "1px solid #ccc",
                                    }}
                                    onClick={() => handlePhotoSelect(index, photo.id)}
                                >
                                    <img src={`http://127.0.0.1:5000${photo.file_path}`} alt={photo.file_name} style={styles.thumbnail} />
                                    <p style={{ fontSize: "12px" }}>{photo.file_name}</p>
                                </div>
                            ))}
                        </div>

                        <input
                            type="date"
                            onChange={(e) => handleEventChange(index, "date", e.target.value)}
                            style={styles.input}
                        />
                        <textarea
                            placeholder="Descripción del evento"
                            onChange={(e) => handleEventChange(index, "description", e.target.value)}
                            style={styles.textarea}
                        />

                        {/* 📌 Botón para eliminar el evento */}
                        <button onClick={() => removeEvent(index)} style={styles.deleteButton}>
                            ❌ Eliminar Evento
                        </button>
                    </div>
                ))}

                <button onClick={handleSubmit} style={styles.submitButton}>
                    Crear Cronología
                </button>
            </div>
        </div>
    );
};

// 📌 Estilos CSS en línea
const styles = {
    input: {
        padding: "10px",
        margin: "10px",
        width: "60%",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    textarea: {
        padding: "10px",
        margin: "10px",
        width: "60%",
        height: "50px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    addButton: {
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px",
        margin: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    deleteButton: {
        backgroundColor: "#ff4d4d",
        color: "white",
        padding: "8px",
        margin: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "12px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    eventCard: {
        border: "1px solid #ccc",
        padding: "10px",
        margin: "10px auto",
        width: "60%",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        textAlign: "center",
    },
    photoSelector: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
        marginTop: "10px",
    },
    photoItem: {
        cursor: "pointer",
        textAlign: "center",
        padding: "5px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        width: "120px",
        backgroundColor: "#f9f9f9",
    },
    thumbnail: {
        width: "100px",
        height: "100px",
        objectFit: "cover",
        borderRadius: "5px",
    },
};

export default CreateTimeline;
