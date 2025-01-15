import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

const MultimodalInteraction = () => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");

  const handleTextSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/process-text", { text });
      setResponse(res.data.response);
    } catch (error) {
      console.error("Error enviando texto:", error);
    }
  };

  const handleVoiceSubmit = async (e) => {
    const formData = new FormData();
    formData.append("audio", e.target.files[0]);

    try {
      const res = await axios.post("http://localhost:5000/process-voice", formData);
      setResponse(res.data.response);
    } catch (error) {
      console.error("Error enviando voz:", error);
    }
  };

  return (
    <div>
        <Navbar/>
      <h3>Interacción Multimodal</h3>
      <div>
        <textarea
          placeholder="Escribe algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleTextSubmit}>Enviar Texto</button>
      </div>
      <div>
        <input type="file" accept="audio/*" onChange={handleVoiceSubmit} />
        <p>Sube una grabación de voz</p>
      </div>
      <div>
        <h4>Respuesta:</h4>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default MultimodalInteraction;
