import React from "react";
import './index.css'; // Para estilos globales
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import WelcomePage from "./pages/WelcomePage";
//import Home from "./pages/Home";
//import ProtectedRoute from "./components/ProtectedRoute";
import Register from './pages/Register';
import Upload from './pages/Upload';
import Photos from "./pages/Photos";
import CreateAlbum from './pages/CreateAlbum'; 
import ViewAlbums from './pages/ViewAlbums';   
import InfoPage from './pages/InfoPage';
import ChangePassword from './pages/ChangePassword';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<InfoPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/photos" element={<Photos />} />
                <Route path="/create-album" element={<CreateAlbum />} />
                <Route path="/view-albums" element={<ViewAlbums />} />
                <Route path="/WelcomePage" element={ <WelcomePage /> } />
                <Route path="/change-password" element={<ChangePassword />} />
            </Routes>
        </Router>
    );
};

export default App;
