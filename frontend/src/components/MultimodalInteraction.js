import React, { useState, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "../style/MultimodalInteraction.css";

const MultimodalInteraction = () => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);

  // Función para manejar el envío de texto
  const handleTextSubmit = async () => {
    console.log("Iniciando envío de texto...");
    console.log(`Texto ingresado: ${text}`);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/process-text", { text });
      console.log("Respuesta recibida del servidor:", res.data);
      setResponse(res.data.photos || []);
    } catch (error) {
      console.error("Error enviando texto:", error);
      alert("Error procesando tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar grabación de audio
  const startRecording = async () => {
    console.log("Iniciando grabación de audio...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log("Fragmento de audio disponible.");
        setAudioChunks((prev) => [...prev, event.data]);
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("Grabación detenida. Procesando audio...");
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        setAudioChunks([]);
        console.log("Audio procesado y listo para enviar.");
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };

  // Función para detener la grabación
  const stopRecording = () => {
    console.log("Deteniendo grabación de audio...");
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Función para borrar la grabación actual
  const deleteRecording = () => {
    console.log("Eliminando grabación actual...");
    setAudioBlob(null);
    setAudioURL(null);
    setAudioChunks([]);
  };

  // Función para manejar la subida de un archivo de audio
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Archivo de audio cargado:", file.name);
      setUploadedAudio(file);
      setAudioBlob(null); // Si se carga un archivo, descartamos el audio grabado
      setAudioURL(URL.createObjectURL(file));
    }
  };

  // Función para enviar el audio al backend
  const handleAudioSubmit = async () => {
    console.log("Iniciando envío de audio...");
    if (!audioBlob && !uploadedAudio) {
      alert("Por favor, grabe o cargue un archivo de audio primero.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob || uploadedAudio);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/process-voice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Respuesta recibida del servidor:", res.data);
      setResponse(res.data.photos || []);
    } catch (error) {
      console.error("Error enviando audio:", error);
      alert("Error procesando tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="multimodal-container">
        <h2>Interacción Multimodal</h2>

        {/* Sección de texto */}
        <div className="input-section">
          <textarea
            placeholder="Escribe algo..."
            value={text}
            onChange={(e) => {
              console.log("Texto cambiado:", e.target.value);
              setText(e.target.value);
            }}
            className="text-input"
          />
          <button onClick={handleTextSubmit} className="submit-button" disabled={loading}>
            {loading ? "Procesando..." : "Enviar Texto"}
          </button>
        </div>

        {/* Sección de audio */}
        <div className="audio-section">
          {/* Controles de grabación */}
          <div className="recording-controls">
            {!recording && (
              <button onClick={startRecording} className="record-button">
                Grabar Audio
              </button>
            )}
            {recording && (
              <button onClick={stopRecording} className="stop-button">
                Detener Grabación
              </button>
            )}
          </div>

          {/* Reproductor de audio */}
          {audioURL && (
            <div className="audio-preview">
              <audio controls src={audioURL} ref={audioRef}></audio>
              <button onClick={deleteRecording} className="delete-button">
                Eliminar Audio
              </button>
            </div>
          )}

          {/* Subir archivo de audio */}
          <div className="file-upload">
            <label htmlFor="file-upload" className="file-upload-label">
              Subir Archivo de Audio
            </label>
            <input
              type="file"
              id="file-upload"
              accept="audio/*"
              onChange={handleFileUpload}
              className="file-upload-input"
            />
          </div>

          {/* Botón para enviar audio */}
          <button onClick={handleAudioSubmit} className="submit-button" disabled={loading}>
            {loading ? "Procesando..." : "Enviar Audio"}
          </button>
        </div>

        {/* Sección de respuesta */}
        <div className="response-section">
          <h4>Respuesta:</h4>
          {response.length > 0 ? (
            <div className="photo-gallery">
              {response.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo.url} alt={photo.name} className="photo-image" />
                  <p>{photo.name}</p>
                  <p>Score: {photo.score.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No se encontraron fotos relacionadas.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default MultimodalInteraction;
