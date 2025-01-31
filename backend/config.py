import os


class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://user_generico:UserGenerico@localhost:5432/DB_PRUEBAS_1?client_encoding=utf8' #Jose
    #SQLALCHEMY_DATABASE_URI = 'postgresql://user_generico:UserGenerico@tfm_proyecto-db-1:5432/db_pruebas_1?client_encoding=utf8' #Bryan
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "secret_key"
    CORS_HEADERS = "Content-Type"
    JWT_ACCESS_TOKEN_EXPIRES = False  # Deshabilita la expiración del token

# Ruta base del proyecto
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
BASE_DIR1 = os.path.dirname(os.path.abspath(__file__))

# Directorio para subir archivos
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

# Directorio temporal para guardar audios
TEMP_AUDIO_DIR = os.path.join(BASE_DIR1, 'temp_audio')

# Crear directorios si no existen
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)