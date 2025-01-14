import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Componente de navegación

function ManualOrganization() {
    const [photos, setPhotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [notes, setNotes] = useState('');
    const [result, setResult] = useState(null);

    const handleOrganize = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/organize/manual', {
                photos,
                videos,
                notes
            });
            setResult(response.data.organized_content);
        } catch (error) {
            console.error('Error en la organización manual:', error);
        }
    };

    return (
        <div>
            <Navbar />
            <h2>Organización Manual</h2>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas"
            />
            <button onClick={handleOrganize}>Organizar Manualmente</button>
            {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </div>
    );
}

export default ManualOrganization;
