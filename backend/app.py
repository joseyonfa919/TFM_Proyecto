from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from models import db, bcrypt
from routes import api_bp
from config import Config
import os
  # Importar la función para crear tablas


app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, 
     supports_credentials=True, 
     expose_headers=["Authorization"],
     allow_headers=["Authorization", "Content-Type"])


# Configuraciones adicionales
#UPLOAD_FOLDER = 'uploads'
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#CORS(app)
JWTManager(app)
# Inicializar las extensiones
db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
# Crea tablas si no existen
#with app.app_context():
#    create_tables()

app.register_blueprint(api_bp)

if __name__ == '__main__':
    with app.app_context():

        # Crear tablas si no existen
        db.create_all()
        print("Tablas creadas o verificadas exitosamente.")

        # Crear el directorio de subida si no existe
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

