from flask import Flask, jsonify, send_from_directory  # Importa Flask y funciones auxiliares
from flask_cors import CORS  # Habilita CORS para manejar solicitudes entre diferentes dominios
from flask_jwt_extended import JWTManager  # Manejo de autenticación con JWT
from flask_migrate import Migrate  # Herramienta para manejar migraciones de la base de datos
from models import db, bcrypt  # Importa la base de datos y bcrypt para encriptación de contraseñas
from routes import api_bp  # Importa el blueprint con las rutas de la API
from config import Config  # Importa la configuración desde config.py
import os  # Módulo para manejo de archivos y directorios
from config import UPLOAD_FOLDER, TEMP_AUDIO_DIR  # Importa las rutas de subida de archivos y audios temporales

# Inicialización de la aplicación Flask
app = Flask(__name__)
app.config.from_object(Config)  # Carga la configuración desde config.py

# Configuración de CORS para permitir solicitudes desde el frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, 
     supports_credentials=True,  # Permite el envío de credenciales en las solicitudes
     expose_headers=["Authorization"],  # Expone la cabecera de autorización
     allow_headers=["Authorization", "Content-Type"])  # Permite el uso de estas cabeceras

# Configuración del directorio donde se subirán los archivos
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Inicialización de extensiones Flask
JWTManager(app)  # Configuración de JWT para manejo de autenticación
db.init_app(app)  # Inicializa la base de datos con la app Flask
bcrypt.init_app(app)  # Inicializa bcrypt para encriptación de contraseñas
migrate = Migrate(app, db)  # Habilita migraciones con Flask-Migrate

# Registro del blueprint que maneja las rutas de la API
app.register_blueprint(api_bp)

# Crear tablas en la base de datos al iniciar la aplicación (si no existen)
with app.app_context():
    try:
        db.create_all()  # Crea todas las tablas definidas en models.py
        print("Tablas creadas exitosamente.")
    except Exception as e:
        print(f"Error al crear tablas: {e}")  # Captura e imprime errores en la creación de tablas

# Crear el directorio de subida de archivos si no existe
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Ruta para servir archivos subidos
#@app.route('/uploads/<filename>')
#def uploaded_file(filename):
#    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Ruta alternativa para servir archivos (puede estar duplicada)
@app.route('/uploads/<filename>')
def serve_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"Error al servir la imagen: {e}", flush=True)  # Imprime errores en consola
        return jsonify({"message": "Error al servir la imagen"}), 500  # Devuelve un error en formato JSON

# Ejecutar la aplicación Flask en modo depuración
if __name__ == '__main__':
    app.run(debug=True)  # Ejecuta la aplicación en modo debug
    #app.run(host="0.0.0.0", port=5000, debug=True)  # Opción para desplegar en un servidor accesible
