import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

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

        // Actualizar el conteo de archivos en el input
        document.querySelector('input[type="file"]').value = null;
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
            <h2 style={{ textAlign: 'center' }}>Subir Fotos o Videos</h2>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'block', margin: '10px auto' }}
                />
                <p style={{ textAlign: 'center' }}>{selectedFiles.length} archivo(s)</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                    {previews.map((preview, index) => (
                        <div key={index} style={{ width: '100px', textAlign: 'center', position: 'relative' }}>
                            <img
                                src={preview}
                                alt={`Preview ${index}`}
                                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                            />
                            <button
                                onClick={() => handleRemoveFile(index)}
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: isUploading ? '#ccc' : '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        marginTop: '20px',
                    }}
                >
                    {isUploading ? 'Subiendo...' : 'Subir Imágenes'}
                </button>
            </div>
        </div>
    );
}

export default Upload;
