import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Componente de navegación

function AIOrganization() {
    const [photos, setPhotos] = useState([]);
    const [notes, setNotes] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        const selectedPhotos = JSON.parse(localStorage.getItem('selected_photos')) || [];
        setPhotos(selectedPhotos);
    }, []);

    const handleOrganize = async () => {
        if (photos.length === 0) {
            alert("Por favor selecciona al menos una foto.");
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/organize/ai', {
                photos,
                notes
            });
            setResult(response.data.organized_content);
        } catch (error) {
            console.error('Error en organización con IA:', error);
            alert("Ocurrió un error al organizar las fotos. Revisa la consola para más detalles.");
        }
    };

    return (
        <div>
            <Navbar />
            <h2>Organización Basada en IA</h2>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas opcionales"
            />
            <button onClick={handleOrganize}>Organizar con IA</button>
            {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </div>
    );
}

export default AIOrganization;
