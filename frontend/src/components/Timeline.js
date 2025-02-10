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
            axios.post(`http://127.0.0.1:5000/timelines/delete`, { timeline_id: timelineId })
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

    if (loading) return <p className="loading-text">Cargando cronologías...</p>;
    if (error) return <p className="error-text">{error}</p>;

    return (
        <div>
            <Navbar />
            <div className="timeline-container">
                <h2 className="timeline-title">Mis Cronologías</h2>
                {timelines.length === 0 ? (
                    <p className="no-timelines-text">No hay cronologías disponibles.</p>
                ) : (
                    timelines.map((timeline) => (
                        <div key={timeline.id} className="timeline-card">
                            <h3 className="timeline-name">{timeline.name}</h3>
                            <p className="timeline-date"><strong>Fecha de Creación:</strong> {new Date(timeline.created_at).toLocaleDateString()}</p>
                            <button 
                                onClick={() => handleDeleteTimeline(timeline.id)}
                                className="delete-timeline-button"
                            >
                                Eliminar Cronología
                            </button>
                            <h4 className="events-title">Eventos:</h4>
                            {timeline.events && timeline.events.length > 0 ? (
                                <ul className="events-list">
                                    {timeline.events.map((event, index) => (
                                        <li key={index} className="event-item">
                                            <strong className="event-date">
                                                {event.date ? new Date(event.date).toLocaleDateString() : "Sin fecha"}:
                                            </strong> 
                                            <span className="event-description">{event.description}</span>
                                            <div className="photo-grid">
                                                {event.photos && event.photos.length > 0 ? (
                                                    event.photos.map((photo) => (
                                                        <img
                                                            key={photo.id}
                                                            src={`http://127.0.0.1:5000${photo.file_path}`}
                                                            alt={photo.file_name || "Imagen"}
                                                            className="photo-preview"
                                                            onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                                                        />
                                                    ))
                                                ) : (
                                                    <p className="no-photos-text">No hay fotos en este evento.</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-events-text">No hay eventos en esta cronología.</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Timeline;
