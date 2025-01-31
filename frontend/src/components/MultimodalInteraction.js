import React, { useState, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Recorder from "recorder-js";
import "../style/MultimodalInteraction.css";

const MultimodalInteraction = () => {
  const [text, setText] = useState("");
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const audioContextRef = useRef(null);
  const recorderRef = useRef(null);

  // Inicializar grabadora con `recorder-js`
  const initializeRecorder = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderRef.current = new Recorder(audioContextRef.current);
      recorderRef.current.init(stream);
    } catch (error) {
      console.error("Error inicializando la grabadora:", error);
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };

  // Iniciar grabación
  const startRecording = async () => {
    if (!recorderRef.current) {
      await initializeRecorder();
    }
    recorderRef.current.start();
    setRecording(true);
  };

  // Detener grabación y guardar el audio en WAV
  const stopRecording = async () => {
    if (!recorderRef.current) return;
    const { blob } = await recorderRef.current.stop();
    setAudioBlob(blob);
    setAudioURL(URL.createObjectURL(blob));
    setUploadedAudio(null);
    setRecording(false);
  };

  // Eliminar el audio grabado o subido
  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setUploadedAudio(null);
  };

  // Manejo de archivos subidos
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedAudio(file);
      setAudioBlob(null); // Si se sube un archivo, se limpia la grabación
      setAudioURL(URL.createObjectURL(file));
    }
  };

  // Enviar texto al backend
  const handleTextSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/process-text", { text });
      setResponse(res.data.photos || []);
    } catch (error) {
      console.error("Error enviando texto:", error);
      alert("Error procesando el texto.");
    } finally {
      setLoading(false);
      setText("");
    }
  };

  // Enviar audio al backend
  const handleAudioSubmit = async () => {
    if (!audioBlob && !uploadedAudio) {
      alert("Por favor, grabe o cargue un archivo de audio antes de enviarlo.");
      return;
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("No se encontró el ID del usuario. Inicia sesión nuevamente.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob || uploadedAudio, uploadedAudio ? uploadedAudio.name : "audio.wav");
    formData.append("user_id", userId);

    setLoading(true);
    try {
      console.log("Enviando audio con user_id:", userId);
      const res = await axios.post("http://localhost:5000/process-voice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Respuesta del backend:", res.data);
      setResponse(res.data.photos || []);
    } catch (error) {
      console.error("Error enviando el audio:", error);
      alert("Error procesando el audio.");
    } finally {
      setLoading(false);
      deleteRecording();
    }
  };

  return (
    <>
      <Navbar />
      <div className="multimodal-container">
        <h2>Acciones con Voz y Texto</h2>

        {/* Entrada de texto */}
        <div className="input-section">
          <textarea
            placeholder="Escribe algo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-input"
          />
          <button onClick={handleTextSubmit} className="submit-button" disabled={loading}>
            {loading ? "Procesando..." : "Enviar Texto"}
          </button>
        </div>

        {/* Grabación de audio */}
        <div className="audio-section">
          <div className="recording-controls">
            {!recording ? (
              <button onClick={startRecording} className="record-button">
                Grabar Audio
              </button>
            ) : (
              <button onClick={stopRecording} className="stop-button">
                Detener Grabación
              </button>
            )}
          </div>

          {/* Reproductor de audio */}
          {audioURL && (
            <div className="audio-preview">
              <audio controls src={audioURL}></audio>
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
            <input type="file" id="file-upload" accept="audio/*" onChange={handleFileUpload} className="file-upload-input" />
          </div>

          {/* Botón para enviar audio */}
          <button onClick={handleAudioSubmit} className="submit-button" disabled={loading}>
            {loading ? "Procesando..." : "Enviar Audio"}
          </button>
        </div>

        {/* Sección de respuesta */}
        <div className="response-section">
          <h4>Resultado:</h4>
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
