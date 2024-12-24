import React from 'react';
import Navbar from '../components/Navbar';

function Home() {
  return (
    <>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Bienvenido a nuestro sistema</h1>
        <p>Regístrate o inicia sesión para acceder a más funcionalidades.</p>
      </div>
    </>
  );
}

export default Home;
