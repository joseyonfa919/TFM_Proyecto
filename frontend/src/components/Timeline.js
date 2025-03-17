import React, { useEffect, useState } from "react"; // Importar React y hooks para manejar estados y efectos
import axios from "axios"; // Librería para hacer peticiones HTTP al backend
import Navbar from "../components/Navbar"; // Importar el componente Navbar
import "../style/Timeline.css"; // Importar los estilos CSS para el componente Timeline

// =========================== COMPONENTE PRINCIPAL TIMELINE ===========================

const Timeline = () => {
    const [timelines, setTimelines] = useState([]); // Estado para almacenar las cronologías del usuario
    const userId = localStorage.getItem("user_id"); // Obtener el ID del usuario desde localStorage
    const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos
    const [error, setError] = useState(null); // Estado para manejar errores en la carga

    // =========================== CARGA DE CRONOLOGÍAS AL MONTAR EL COMPONENTE ===========================

    useEffect(() => {
        if (!userId) {
            alert("Inicia sesión primero."); // Mostrar alerta si el usuario no ha iniciado sesión
            return;
        }
        axios.get(`http://127.0.0.1:5000/timelines?user_id=${userId}`)
            .then(response => {
                // Ordenar cronologías por fecha de creación
                const sortedTimelines = response.data?.timelines?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || [];
                setTimelines(sortedTimelines);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener cronologías:", error);
                setError("Error al cargar las cronologías"); // Guardar mensaje de error en el estado
                setLoading(false);
            });
    }, [userId]);

    // =========================== ELIMINAR UNA CRONOLOGÍA ===========================

    const handleDeleteTimeline = (timelineId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta cronología? Esta acción no se puede deshacer.")) {
            axios.post(`http://127.0.0.1:5000/timelines/delete`, { timeline_id: timelineId })
                .then(() => {
                    setTimelines(timelines.filter(timeline => timeline.id !== timelineId)); // Filtrar para eliminar visualmente la cronología
                    alert("Cronología eliminada correctamente.");
                })
                .catch(error => {
                    console.error("Error al eliminar la cronología:", error);
                    alert("Hubo un error al eliminar la cronología.");
                });
        }
    };

    // =========================== MOSTRAR MENSAJES DE CARGA Y ERROR ===========================

    if (loading) return <p className="loading-text">Cargando cronologías...</p>; // Mostrar mensaje mientras se cargan los datos
    if (error) return <p className="error-text">{error}</p>; // Mostrar mensaje si ocurre un error

    return (
        <div>
            <Navbar /> {/* Navbar en la parte superior */}
            <div className="timeline-container">
                <h2 className="timeline-title">Mis Cronologías</h2>

                {timelines.length === 0 ? (
                    <p className="no-timelines-text">No hay cronologías disponibles.</p> // Mensaje si no hay cronologías
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
                                                        photo.file_path.endsWith(".mp4") || photo.file_path.endsWith(".webm") || photo.file_path.endsWith(".ogg") ? (
                                                            <video
                                                                key={photo.id}
                                                                controls
                                                                className="video-preview"
                                                                src={`http://127.0.0.1:5000${photo.file_path}`} // URL del backend para mostrar el video
                                                            >
                                                                Tu navegador no soporta la reproducción de videos.
                                                            </video>
                                                        ) : (
                                                            <img
                                                                key={photo.id}
                                                                src={`http://127.0.0.1:5000${photo.file_path}`} // URL del backend para mostrar la imagen
                                                                alt={photo.file_name || "Imagen"}
                                                                className="photo-preview"
                                                                onError={(e) => e.target.src = "https://via.placeholder.com/100"} // Imagen de respaldo si falla la carga
                                                            />
                                                        )
                                                    ))
                                                ) : (
                                                    <p className="no-photos-text">No hay fotos en este evento.</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-events-text">No hay eventos en esta cronología.</p> // Mensaje si la cronología no tiene eventos
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Timeline;
