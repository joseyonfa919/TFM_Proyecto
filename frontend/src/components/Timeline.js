import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../style/Timeline.css";

const Timeline = () => {
    const [timelines, setTimelines] = useState([]);
    const userId = localStorage.getItem("user_id");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            alert("Inicia sesión primero.");
            return;
        }
        axios.get(`http://127.0.0.1:5000/timelines?user_id=${userId}`)
            .then(response => {
                const sortedTimelines = response.data?.timelines?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || [];
                setTimelines(sortedTimelines);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener cronologías:", error);
                setError("Error al cargar las cronologías");
                setLoading(false);
            });
    }, [userId]);

    const handleDeleteTimeline = (timelineId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta cronología? Esta acción no se puede deshacer.")) {
            axios.delete(`http://127.0.0.1:5000/timelines/${timelineId}`)
                .then(() => {
                    setTimelines(timelines.filter(timeline => timeline.id !== timelineId));
                    alert("Cronología eliminada correctamente.");
                })
                .catch(error => {
                    console.error("Error al eliminar la cronología:", error);
                    alert("Hubo un error al eliminar la cronología.");
                });
        }
    };

    if (loading) return <p>Cargando cronologías...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <Navbar />
            <div className="timeline-container">
                <h2 className="title">Mis Cronologías</h2>
                {timelines.length === 0 ? (
                    <p>No hay cronologías disponibles.</p>
                ) : (
                    timelines.map((timeline) => (
                        <div key={timeline.id} className="timeline-card">
                            <h3>{timeline.name}</h3>
                            <p><strong>Fecha de Creación:</strong> {new Date(timeline.created_at).toLocaleDateString()}</p>
                            <button 
                                onClick={() => handleDeleteTimeline(timeline.id)}
                                style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginBottom: '10px' }}
                            >
                                Eliminar Cronología
                            </button>
                            <h4>Eventos:</h4>
                            {timeline.events && timeline.events.length > 0 ? (
                                <ul>
                                    {timeline.events.map((event, index) => (
                                        <li key={index}>
                                            <strong>{event.date ? new Date(event.date).toLocaleDateString() : "Sin fecha"}:</strong> {event.description}
                                            <div className="photo-grid">
                                                {event.photos && event.photos.length > 0 ? (
                                                    event.photos.map((photo) => (
                                                        <img
                                                            key={photo.id}
                                                            src={`http://127.0.0.1:5000/uploads/${photo.file_name}`}
                                                            alt={photo.file_name || "Imagen"}
                                                            className="photo-preview"
                                                            onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                                                        />
                                                    ))
                                                ) : (
                                                    <p>No hay fotos en este evento.</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No hay eventos en esta cronología.</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Timeline;
