import React, { useState } from 'react'; // Importa React y el hook useState para manejar estados
import axios from 'axios'; // Importa Axios para realizar peticiones HTTP al backend
import Navbar from '../components/Navbar'; // Importa el componente Navbar para la navegación
import { FaTrash, FaFileImage } from 'react-icons/fa'; // Importa íconos para mejorar la interfaz
import '../style/Upload.css'; // Importa los estilos CSS específicos para este componente

// =========================== COMPONENTE PRINCIPAL UPLOAD ===========================

function Upload() {
    // Estados para manejar la selección de archivos, previsualización y estado de carga
    const [selectedFiles, setSelectedFiles] = useState([]); // Almacena los archivos seleccionados
    const [previews, setPreviews] = useState([]); // Almacena las previsualizaciones de los archivos
    const [isUploading, setIsUploading] = useState(false); // Estado para manejar la carga del formulario

    // =========================== MANEJAR SELECCIÓN DE ARCHIVOS ===========================

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files); // Convierte FileList a un array
        setSelectedFiles(files); // Guarda los archivos seleccionados

        // Genera previsualizaciones de las imágenes seleccionadas
        const filePreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews(filePreviews);
    };

    // =========================== ELIMINAR ARCHIVOS SELECCIONADOS ===========================

    const handleRemoveFile = (index) => {
        const updatedFiles = [...selectedFiles];
        const updatedPreviews = [...previews];

        updatedFiles.splice(index, 1); // Elimina el archivo seleccionado
        updatedPreviews.splice(index, 1); // Elimina la previsualización correspondiente

        setSelectedFiles(updatedFiles);
        setPreviews(updatedPreviews);
    };

    // =========================== SUBIR ARCHIVOS AL BACKEND ===========================

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert('Por favor, selecciona al menos un archivo.');
            return;
        }

        const userId = localStorage.getItem('user_id'); // Obtener el ID del usuario desde localStorage
        if (!userId) {
            alert('No se encontró el ID del usuario. Por favor inicia sesión nuevamente.');
            return;
        }

        const formData = new FormData(); // Crear objeto FormData para enviar archivos
        selectedFiles.forEach((file) => {
            formData.append('files', file); // Agregar cada archivo al formulario
        });
        formData.append('user_id', userId); // Adjuntar el ID del usuario

        setIsUploading(true); // Indicar que la subida está en proceso
        try {
            // Enviar archivos al backend
            const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message); // Mostrar mensaje de éxito recibido del backend
            setSelectedFiles([]); // Limpiar los archivos seleccionados después de la subida
            setPreviews([]); // Limpiar las previsualizaciones
        } catch (error) {
            console.error('Error al subir las imágenes:', error);
            alert('Error al subir las imágenes.'); // Mostrar mensaje de error
        } finally {
            setIsUploading(false); // Finalizar el estado de carga
        }
    };

    return (
        <div>
            <Navbar /> {/* Incluir la barra de navegación */}
            <div className="upload-container">
                
                <h2 className="upload-title">📤 Subir Fotos o Videos</h2> {/* Título principal */}

                {/* Contenedor para seleccionar archivos */}
                <div className="upload-box" onClick={() => document.getElementById('file-input').click()}>
                    <FaFileImage size={40} color="#666" />
                    <p>Arrastra aquí tus fotos o videos o haz clic para seleccionarlos</p>
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Muestra la cantidad de archivos seleccionados */}
                <p className="file-count">{selectedFiles.length} archivo(s) seleccionado(s)</p>

                {/* Contenedor de previsualización de imágenes */}
                <div className="preview-container">
                    {previews.map((preview, index) => (
                        <div key={index} className="preview-box">
                            <img src={preview} alt={`Preview ${index}`} className="preview-image" />
                            <button className="remove-button" onClick={() => handleRemoveFile(index)}>
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Botón para subir archivos */}
                <button className="upload-button" onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? 'Subiendo...' : '📤 Subir Imágenes'}
                </button>
            </div>
        </div>
    );
}

export default Upload; // Exporta el componente para su uso en la aplicación
