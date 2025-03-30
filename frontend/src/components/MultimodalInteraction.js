import React, { useState, useRef } from "react"; // Importación de React y hooks para manejar estados y referencias
import axios from "axios"; // Librería para hacer peticiones HTTP al backend
import Navbar from "./Navbar"; // Importación del componente Navbar
import Recorder from "recorder-js"; // Librería para grabación de audio en el navegador
import "../style/MultimodalInteraction.css"; // Importación de los estilos CSS del componente

// =========================== COMPONENTE PRINCIPAL ===========================

const MultimodalInteraction = () => {
  // Estados para manejar texto, respuesta del backend y estados de carga
  const [text, setText] = useState("");
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para manejar la grabación de audio
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [uploadedAudio, setUploadedAudio] = useState(null);

  // Referencias para la grabadora de audio
  const audioContextRef = useRef(null);
  const recorderRef = useRef(null);

  // =========================== INICIALIZAR GRABADORA ===========================

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

  // =========================== INICIAR Y DETENER GRABACIÓN ===========================

  const startRecording = async () => {
    if (!recorderRef.current) {
      await initializeRecorder();
    }
    recorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;
    const { blob } = await recorderRef.current.stop();
    setAudioBlob(blob);
    setAudioURL(URL.createObjectURL(blob)); // Generar URL para previsualización
    setUploadedAudio(null);
    setRecording(false);
  };

  // =========================== ELIMINAR AUDIO GRABADO ===========================

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setUploadedAudio(null);
  };

  // =========================== MANEJO DE ARCHIVOS DE AUDIO SUBIDOS ===========================

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedAudio(file);
      setAudioBlob(null); // Si se sube un archivo, se limpia la grabación
      setAudioURL(URL.createObjectURL(file));
    }
  };

  // =========================== ENVÍO DE TEXTO AL BACKEND ===========================

  const handleTextSubmit = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_id"); // 🔥 Obtener el ID del usuario

      if (!userId) {
        alert("No se encontró el ID del usuario. Inicia sesión nuevamente.");
        return;
      }

      console.log("📡 Enviando texto con user_id:", userId); // 🛠 Debugging

      const res = await axios.post(
        "http://localhost:5000/process-text",
        { text, user_id: userId }, // 🔥 Enviar user_id en el body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}` // 🔒 Enviar token de autenticación
          }
        }
      );

      console.log("📡 Respuesta del backend:", res.data); // 🔍 Verificar en la consola
      setResponse(res.data.photos || []);
    } catch (error) {
      console.error("❌ Error enviando texto:", error);
      alert("Error procesando el texto.");
    } finally {
      setLoading(false);
      setText("");
    }
  };


  // =========================== ENVÍO DE AUDIO AL BACKEND ===========================

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
            disabled={loading}
          />
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <button onClick={handleTextSubmit} className="submit-button" disabled={loading}>
              Enviar Texto
            </button>
          )}
        </div>

        {/* Grabación de audio */}
        <div className="audio-section">
          <div className="recording-controls">
            {!recording ? (
              <button onClick={startRecording} className="record-button" disabled={loading}>
                Grabar Audio
              </button>
            ) : (
              <button onClick={stopRecording} className="stop-button" disabled={loading}>
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
            <input type="file" id="file-upload" accept="audio/*"
              onChange={handleFileUpload}
              className="file-upload-input"
              disabled={loading}
            />
          </div>

          {/* Botón para enviar audio */}
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <button onClick={handleAudioSubmit} className="submit-button" disabled={loading}>
              Enviar Audio
            </button>
          )}
        </div>

        {/* Sección de respuesta */}
        <div className="response-section">
          <h4>Resultado:</h4>
          {response.length > 0 ? (
            <div className="photo-gallery">
              {response.map((media, index) => (
                <div key={index} className="photo-item">
                  {media.type === "video" ? (
                    <video controls className="photo-video">
                      <source src={`http://localhost:5000${media.url}`} type="video/mp4" />
                      Tu navegador no soporta el tag de video.
                    </video>
                  ) : (
                    <img src={`http://localhost:5000${media.url}`} alt={media.name} className="photo-image" />
                  )}
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

export default MultimodalInteraction; // Exportación del componente
