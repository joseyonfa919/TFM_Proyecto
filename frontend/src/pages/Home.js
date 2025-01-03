import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="home-container">
            <h1>Bienvenido a nuestro sistema</h1>
            <p>Regístrate o inicia sesión para acceder a más funcionalidades.</p>
            <div className="home-buttons">
                <Link to="/login">
                    <button>Iniciar Sesión</button>
                </Link>
                <Link to="/register">
                    <button>Registrarse</button>
                </Link>
            </div>
        </div>
    );
};

export default Home;
