from flask import Flask, current_app, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from models import db, bcrypt
from routes import api_bp
from config import Config
import os
from config import UPLOAD_FOLDER, TEMP_AUDIO_DIR

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, 
     supports_credentials=True, 
     expose_headers=["Authorization"],
     allow_headers=["Authorization", "Content-Type"])

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER



JWTManager(app)
db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(api_bp)

# Crear tablas manualmente durante la inicialización de la aplicación
with app.app_context():
    try:
        db.create_all()
        print("Tablas creadas exitosamente.")
    except Exception as e:
        print(f"Error al crear tablas: {e}")

# Crear el directorio de subida si no existe
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/uploads/<filename>')
def serve_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"Error al servir la imagen: {e}", flush=True)
        return jsonify({"message": "Error al servir la imagen"}), 500


if __name__ == '__main__':
    app.run(debug=True)
    #app.run(host="0.0.0.0", port=5000, debug=True)