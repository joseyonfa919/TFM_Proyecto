from flask_sqlalchemy import SQLAlchemy  # ORM para manejo de base de datos
from datetime import datetime, timedelta  # Manejo de fechas y tiempos
from flask_bcrypt import Bcrypt  # Biblioteca para encriptación de contraseñas
import uuid  # Generación de identificadores únicos

# Inicialización de la base de datos y encriptación de contraseñas
db = SQLAlchemy()
bcrypt = Bcrypt()

# Modelo de usuario
class User(db.Model):
    __tablename__ = 'users'  # Nombre de la tabla en la base de datos

    id = db.Column(db.Integer, primary_key=True)  # Identificador único del usuario
    name = db.Column(db.String(100), nullable=False)  # Nombre del usuario
    email = db.Column(db.String(120), unique=True, nullable=False)  # Correo electrónico único
    password = db.Column(db.String(200), nullable=False)  # Contraseña encriptada
    reset_token = db.Column(db.String(200), nullable=True)  # Token para restablecimiento de contraseña
    reset_token_expiration = db.Column(db.DateTime, nullable=True)  # Fecha de expiración del token

    # Método para generar un token de restablecimiento de contraseña
    def generate_reset_token(self):
        self.reset_token = str(uuid.uuid4())  # Genera un token único
        self.reset_token_expiration = datetime.utcnow() + timedelta(hours=1)  # Expira en 1 hora
        db.session.commit()

    # Relación con las imágenes subidas por el usuario
    images = db.relationship('Image', back_populates='user', lazy=True)
    albums = db.relationship('Album', back_populates='user', lazy=True)

# Modelo de álbum para agrupar imágenes
class Album(db.Model):
    __tablename__ = 'albums'  # Nombre de la tabla en la base de datos

    id = db.Column(db.Integer, primary_key=True)  # Identificador único del álbum
    name = db.Column(db.String(100), nullable=False)  # Nombre del álbum
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Fecha de creación del álbum
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Relación con el usuario propietario
    share_token = db.Column(db.String(100), unique=True) 

    # Relación con las imágenes contenidas en el álbum

    user = db.relationship('User', back_populates='albums', lazy=True)
    photos = db.relationship('Image', back_populates='album', lazy=True)


# Modelo de imagen
class Image(db.Model):
    __tablename__ = 'images'  # Nombre de la tabla en la base de datos

    id = db.Column(db.Integer, primary_key=True)  # Identificador único de la imagen
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Relación con el usuario propietario
    file_name = db.Column(db.String(255), nullable=False)  # Nombre del archivo de imagen
    file_path = db.Column(db.String(500), nullable=False)  # Ruta del archivo de imagen
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Fecha de carga de la imagen

    # Relación con el álbum al que pertenece la imagen
    album_id = db.Column(db.Integer, db.ForeignKey('albums.id'), nullable=True)
    album = db.relationship('Album', back_populates='photos', lazy=True)

    # Relación con el usuario propietario de la imagen
    user = db.relationship('User', back_populates='images')

    # Relación con eventos (permite múltiples imágenes en un evento)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=True)

# Modelo de cronología (timeline) para organizar eventos
class Timeline(db.Model):
    __tablename__ = 'timelines'  # Nombre de la tabla en la base de datos

    id = db.Column(db.Integer, primary_key=True)  # Identificador único de la cronología
    name = db.Column(db.String(100), nullable=False)  # Nombre de la cronología
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Relación con el usuario propietario
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Fecha de creación de la cronología

    # Relación con eventos dentro de la cronología
    events = db.relationship('Event', back_populates='timeline', lazy=True, cascade="all, delete-orphan")

# Modelo de evento dentro de una cronología
class Event(db.Model):
    __tablename__ = 'events'  # Nombre de la tabla en la base de datos

    id = db.Column(db.Integer, primary_key=True)  # Identificador único del evento
    timeline_id = db.Column(db.Integer, db.ForeignKey('timelines.id'), nullable=False)  # Relación con la cronología
    date = db.Column(db.DateTime, nullable=False)  # Fecha del evento
    description = db.Column(db.String(255), nullable=False)  # Descripción del evento

    # Relación con la cronología (timeline) a la que pertenece el evento
    timeline = db.relationship('Timeline', back_populates='events')

    # Relación con imágenes asociadas al evento
    images = db.relationship('Image', backref='event', lazy=True)
