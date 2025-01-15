import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

const Timeline = () => {
  const [timelineName, setTimelineName] = useState("");
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ photo_id: "", description: "", date: "" });

  const handleAddEvent = () => {
    setEvents([...events, newEvent]);
    setNewEvent({ photo_id: "", description: "", date: "" });
  };

  const handleCreateTimeline = async () => {
    try {
      const res = await axios.post("http://localhost:5000/timelines/create", {
        user_id: 1, // Reemplaza con el ID del usuario autenticado
        name: timelineName,
        events,
      });
      alert("Cronología creada con éxito: " + res.data.timeline_id);
    } catch (error) {
      console.error("Error creando cronología:", error);
    }
  };

  return (
    <div>
        <Navbar/>
      <h3>Crear Cronología</h3>
      <input
        type="text"
        placeholder="Nombre de la Cronología"
        value={timelineName}
        onChange={(e) => setTimelineName(e.target.value)}
      />
      <h4>Añadir Evento</h4>
      <input
        type="text"
        placeholder="Descripción"
        value={newEvent.description}
        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
      />
      <input
        type="date"
        value={newEvent.date}
        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
      />
      <button onClick={handleAddEvent}>Añadir Evento</button>
      <h4>Eventos:</h4>
      <ul>
        {events.map((event, index) => (
          <li key={index}>{event.description} - {event.date}</li>
        ))}
      </ul>
      <button onClick={handleCreateTimeline}>Crear Cronología</button>
    </div>
  );
};

export default Timeline;
