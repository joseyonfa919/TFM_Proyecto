import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Photos from "./pages/Photos";
import CreateAlbum from './pages/CreateAlbum'; 
import ViewAlbums from './pages/ViewAlbums';   

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/create-album" element={<CreateAlbum />} />
        <Route path="/view-albums" element={<ViewAlbums />} />
      </Routes>
    </Router>
  );
}


export default App;



