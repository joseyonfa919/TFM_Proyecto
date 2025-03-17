import React from "react"; // Importa React para manejar los componentes
import './index.css'; // Importa los estilos generales de la aplicación
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importa herramientas de enrutamiento

// =========================== IMPORTACIÓN DE PÁGINAS Y COMPONENTES ===========================

import Login from "./pages/Login"; // Página de inicio de sesión
import WelcomePage from "./pages/WelcomePage"; // Página de bienvenida
import Register from './pages/Register'; // Página de registro de usuarios
import Upload from './pages/Upload'; // Página para subir archivos multimedia
import Photos from "./pages/Photos"; // Página para visualizar las fotos subidas
import CreateAlbum from './pages/CreateAlbum'; // Página para crear álbumes de fotos
import ViewAlbums from './pages/ViewAlbums'; // Página para ver los álbumes creados
import InfoPage from './pages/InfoPage'; // Página principal con información sobre la aplicación
import SharedAlbum from './pages/SharedAlbum'; // Página para ver álbumes compartidos mediante un enlace
import ChangePassword from './pages/ChangePassword'; // Página para cambiar la contraseña
import ForgotPassword from './pages/ForgotPassword'; // Página para recuperar la contraseña olvidada
import ResetPassword from './pages/ResetPassword'; // Página para restablecer la contraseña mediante un token
import MultimodalInteraction from "./components/MultimodalInteraction"; // Página de interacción con IA y voz
import Timeline from "./components/Timeline"; // Página para visualizar cronologías
import CreateTimeline from "./pages/CreateTimeline"; // Página para crear nuevas cronologías
import './style/WelcomePage.css'; // Importa los estilos específicos de la página de bienvenida

// =========================== CONFIGURACIÓN DE RUTAS ===========================

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<InfoPage />} /> {/* Página principal */}
                <Route path="/login" element={<Login />} /> {/* Ruta para iniciar sesión */}
                <Route path="/register" element={<Register />} /> {/* Ruta para registrarse */}
                <Route path="/upload" element={<Upload />} /> {/* Ruta para subir archivos */}
                <Route path="/photos" element={<Photos />} /> {/* Ruta para ver fotos subidas */}
                <Route path="/create-album" element={<CreateAlbum />} /> {/* Ruta para crear un álbum */}
                <Route path="/view-albums" element={<ViewAlbums />} /> {/* Ruta para ver los álbumes */}
                <Route path="/WelcomePage" element={<WelcomePage />} /> {/* Ruta para la página de bienvenida */}
                <Route path="/shared/:token" element={<SharedAlbum />} /> {/* Ruta para ver un álbum compartido */}
                <Route path="/change-password" element={<ChangePassword />} /> {/* Ruta para cambiar la contraseña */}
                <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Ruta para recuperar contraseña olvidada */}
                <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* Ruta para restablecer contraseña con token */}
                <Route path="/multimodal" element={<MultimodalInteraction />} /> {/* Ruta para interacción con IA y voz */}
                <Route path="/timeline" element={<Timeline />} /> {/* Ruta para ver cronologías */}
                <Route path="/create-timeline" element={<CreateTimeline />} /> {/* Ruta para crear una nueva cronología */}
            </Routes>
        </Router>
    );
};

export default App; // Exporta el componente App para ser usado en toda la aplicación
