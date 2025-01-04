import React from "react";
import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import WelcomePage from "./pages/WelcomePage";
import Register from './pages/Register';
import Upload from './pages/Upload';
import Photos from "./pages/Photos";
import CreateAlbum from './pages/CreateAlbum'; 
import ViewAlbums from './pages/ViewAlbums';
import InfoPage from './pages/InfoPage';
import SharedAlbum from './pages/SharedAlbum'; 
import ChangePassword from './pages/ChangePassword';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<InfoPage />} />   
                <Route path="/login" element={<Login />} /> {/* Ruta para iniciar sesion */}
                <Route path="/register" element={<Register />} /> {/* Ruta para registrarse */}
                <Route path="/upload" element={<Upload />} /> {/* Ruta para subir fotos subidas */}
                <Route path="/photos" element={<Photos />} /> {/* Ruta para ver fotos */}
                <Route path="/create-album" element={<CreateAlbum />} /> {/* Ruta para crear álbum  */}
                <Route path="/view-albums" element={<ViewAlbums />} /> {/* Ruta para ver álbum subidos */}
                <Route path="/WelcomePage" element={<WelcomePage />} /> {/* Ruta para pagina inicial */}
                <Route path="/shared/:token" element={<SharedAlbum />} /> {/* Ruta para álbum compartido */}
                <Route path="/change-password" element={<ChangePassword />} /> {/* Ruta para recuperar la contraseña */}
            </Routes>
        </Router>
    );
};

export default App;
