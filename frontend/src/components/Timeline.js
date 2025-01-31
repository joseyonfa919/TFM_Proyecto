import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const Timeline = () => {
    const [timelines, setTimelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            alert("Inicia sesión primero.");
            return;
        }
        axios.get(`http://127.0.0.1:5000/timelines?user_id=${userId}`)
            .then(response => {
                setTimelines(response.data.timelines);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener cronologías:", error);
                setLoading(false);
            });
    }, [userId]);

    return (
        <div>
            <Navbar />
            <div style={{ textAlign: "center", padding: "20px" }}>
                <h2 style={{ color: "#4CAF50" }}>Mis Cronologías</h2>
                {loading ? (
                    <p>Cargando...</p>
                ) : timelines.length === 0 ? (
                    <p>No tienes cronologías creadas.</p>
                ) : (
                    timelines.map((timeline) => (
                        <div key={timeline.id} style={styles.timelineCard}>
                            <h3>{timeline.name}</h3>
                            <p><strong>Creada:</strong> {timeline.created_at ? new Date(timeline.created_at).toLocaleDateString() : "Fecha no disponible"}</p>
                            
                            {timeline.events.length === 0 ? (
                                <p>No hay eventos en esta cronología.</p>
                            ) : (
                                timeline.events.map((event) => (
                                    <div key={event.id} style={styles.eventCard}>
                                        <p><strong>Fecha:</strong> {new Date(event.date).toLocaleDateString()}</p>
                                        <p><strong>Descripción:</strong> {event.description}</p>
                                        
                                        {event.photo_path ? (
                                            <img
                                                src={`http://127.0.0.1:5000${event.photo_path}`}  // ✅ Asegurar que se usa la URL correcta
                                                alt={event.file_name} style={styles.thumbnail}
                                            />
                                        ) : (
                                            <p>📌 No hay imagen disponible</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    timelineCard: {
        border: "1px solid #ccc",
        padding: "15px",
        margin: "10px auto",
        width: "60%",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    eventCard: {
        marginTop: "10px",
        padding: "10px",
        backgroundColor: "#f9f9f9",
        borderRadius: "5px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    image: {
        width: "150px",
        height: "150px",
        borderRadius: "5px",
        marginTop: "10px",
        objectFit: "cover",
    },
};

export default Timeline;
