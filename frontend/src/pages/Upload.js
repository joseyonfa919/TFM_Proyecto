import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {  FaTrash, FaFileImage } from 'react-icons/fa';
import '../style/Upload.css';

function Upload() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);

        // Generar previsualizaciones
        const filePreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews(filePreviews);
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = [...selectedFiles];
        const updatedPreviews = [...previews];

        updatedFiles.splice(index, 1);
        updatedPreviews.splice(index, 1);

        setSelectedFiles(updatedFiles);
        setPreviews(updatedPreviews);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert('Por favor, selecciona al menos un archivo.');
            return;
        }

        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('No se encontró el ID del usuario. Por favor inicia sesión nuevamente.');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('user_id', userId);

        setIsUploading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message);
            setSelectedFiles([]);
            setPreviews([]);
        } catch (error) {
            console.error('Error al subir las imágenes:', error);
            alert('Error al subir las imágenes.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
        <Navbar />
        <div className="upload-container">
            
            <h2 className="upload-title">📤 Subir Fotos o Videos</h2>
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
            <p className="file-count">{selectedFiles.length} archivo(s) seleccionado(s)</p>
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
            <button className="upload-button" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Subiendo...' : '📤 Subir Imágenes'}
            </button>
        </div>
        </div>
    );
}

export default Upload;
