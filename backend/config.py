import os  # Módulo para manejar rutas y directorios del sistema operativo

class Config:
    # Configuración de la conexión a la base de datos PostgreSQL
    SQLALCHEMY_DATABASE_URI = 'postgresql://user_generico:UserGenerico@localhost:5432/DB_PRUEBAS_1?client_encoding=utf8'  # Conexión de José
    #SQLALCHEMY_DATABASE_URI = 'postgresql://user_generico:UserGenerico@tfm_proyecto-db-1:5432/db_pruebas_1?client_encoding=utf8'  # Conexión de Bryan
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Desactiva el rastreo de modificaciones de SQLAlchemy para mejorar el rendimiento
    JWT_SECRET_KEY = "secret_key"  # Clave secreta para la autenticación con JWT
    CORS_HEADERS = "Content-Type"  # Define qué cabeceras se permiten en solicitudes CORS
    JWT_ACCESS_TOKEN_EXPIRES = False  # Deshabilita la expiración del token de acceso JWT

# Obtiene la ruta base del proyecto
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
BASE_DIR1 = os.path.dirname(os.path.abspath(__file__))

# Define el directorio donde se subirán los archivos
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

# Define el directorio temporal donde se almacenarán los audios
TEMP_AUDIO_DIR = os.path.join(BASE_DIR1, 'temp_audio')

# Crea los directorios si no existen para evitar errores en tiempo de ejecución
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)
