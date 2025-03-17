import React, { useState, useEffect } from "react"; // Importa React y los hooks useState y useEffect
import axios from "axios"; // Importa Axios para realizar peticiones HTTP al backend
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación
import '../style/CreateTimeline.css'; // Importa los estilos CSS específicos para este componente

function CreateTimeline() {
    // Estados para manejar la información de la cronología, álbumes y eventos
    const [timelineName, setTimelineName] = useState(""); // Estado para almacenar el nombre de la cronología
    const [albums, setAlbums] = useState([]); // Estado para almacenar la lista de álbumes del usuario
    const [selectedAlbum, setSelectedAlbum] = useState(null); // Estado para almacenar el álbum seleccionado
    const [events, setEvents] = useState([]); // Estado para almacenar los eventos agregados a la cronología
    const userId = localStorage.getItem("user_id"); // Obtener el ID del usuario desde localStorage

    // =========================== CARGA DE ÁLBUMES AL MONTAR EL COMPONENTE ===========================

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/albums", {
                    params: { user_id: userId }, // Pasar el user_id como parámetro
                });
                setAlbums(response.data); // Almacenar los álbumes en el estado
            } catch (error) {
                console.error("Error al obtener los álbumes:", error);
            }
        };

        fetchAlbums(); // Ejecutar la función al montar el componente
    }, [userId]);

    // =========================== MANEJO DE SELECCIÓN DE ÁLBUM ===========================

    const handleAlbumSelection = (albumId) => {
        setSelectedAlbum(albumId); // Guardar el ID del álbum seleccionado
    };

    // =========================== MANEJO DE EVENTOS ===========================

    const handleRemoveEvent = (index) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const handleEventChange = (index, field, value) => {
        const updatedEvents = [...events];
        updatedEvents[index][field] = value;
        setEvents(updatedEvents);
    };

    // =========================== MANEJO DE SELECCIÓN DE FOTOS ===========================

    const handlePhotoSelection = (eventIndex, photo) => {
        setEvents(prevEvents => {
            return prevEvents.map((event, idx) => {
                if (idx === eventIndex) {
                    const isSelected = event.selectedPhotos.some(p => p.id === photo.id);
                    return {
                        ...event,
                        selectedPhotos: isSelected
                            ? event.selectedPhotos.filter(p => p.id !== photo.id)
                            : [...event.selectedPhotos, photo],
                    };
                }
                return event;
            });
        });
    };

    // =========================== AGREGAR NUEVO EVENTO ===========================

    const handleAddEvent = () => {
        if (!selectedAlbum) {
            alert("Por favor, selecciona un álbum antes de agregar un evento.");
            return;
        }

        const newEvent = { name: "", date: "", description: "", selectedPhotos: [] };

        // Agregar el nuevo evento al inicio de la lista en lugar del final
        setEvents([newEvent, ...events]);
    };

    // =========================== ENVIAR CRONOLOGÍA AL BACKEND ===========================

    const handleSubmit = async () => {
        const timelineData = {
            name: timelineName,
            user_id: userId,
            events: events.map(event => ({
                date: event.date,
                description: event.description,
                photo_ids: event.selectedPhotos.map(photo => photo.id)
            }))
        };
    
        try {
            await axios.post('http://127.0.0.1:5000/timelines/create', timelineData);
            alert("Cronología creada exitosamente");
    
            // 🔹 Limpiar el estado después de crear la cronología
            setTimelineName("");  // Vaciar el nombre de la cronología
            setSelectedAlbum(null);  // Deseleccionar el álbum
            setEvents([]);  // Vaciar la lista de eventos
        } catch (error) {
            console.error("Error al crear la cronología:", error);
            alert("Error al crear la cronología.");
        }
    };

    return (
        <div>
            <Navbar /> {/* Incluir la barra de navegación */}
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
                                    photo.file_name.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                        <img key={photo.id} src={`http://127.0.0.1:5000/uploads/${photo.file_name}`} 
                                        alt={photo.file_name} style={{ width: "100px", height: "100px", border: "2px solid green" }} />
                                    ) : (
                                        <video key={photo.id} controls style={{ width: "100px", height: "100px", border: "2px solid green" }}>
                                            <source src={`http://127.0.0.1:5000/uploads/${photo.file_name}`} type="video/mp4" />
                                        </video>
                                    )
                                ))}
                            </div>

                            <h4>Selecciona fotos para este evento:</h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {albums.find((album) => album.id.toString() === selectedAlbum)?.photos.map((photo) => (
                                    <div key={photo.id} onClick={() => handlePhotoSelection(index, photo)} 
                                    style={{ cursor: "pointer", border: event.selectedPhotos.some(p => p.id === photo.id) ? "2px solid green" : "2px solid #ccc" }}>
                                        {photo.file_name.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                            <img src={`http://127.0.0.1:5000/uploads/${photo.file_name}`} 
                                            alt={photo.file_name} style={{ width: "100px", height: "100px" }} />
                                        ) : (
                                            <video controls style={{ width: "100px", height: "100px" }}>
                                                <source src={`http://127.0.0.1:5000/uploads/${photo.file_name}`} type="video/mp4" />
                                            </video>
                                        )}
                                    </div>
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

export default CreateTimeline; // Exportar el componente para su uso en la aplicación
