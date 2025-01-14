from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask import current_app
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
import uuid


db = SQLAlchemy()
bcrypt = Bcrypt()




class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    reset_token = db.Column(db.String(200), nullable=True)  # Token para restablecimiento de contraseña
    reset_token_expiration = db.Column(db.DateTime, nullable=True)  # Fecha de expiración del token

    def generate_reset_token(self):
        self.reset_token = str(uuid.uuid4())  # Genera un token único
        self.reset_token_expiration = datetime.utcnow() + timedelta(hours=1)  # Expira en 1 hora
        db.session.commit()

    # Relación con las imágenes
    images = db.relationship('Image', back_populates='user', lazy=True)


    #id = db.Column(db.Integer, primary_key=True)
    #email = db.Column(db.String(120), unique=True, nullable=False)
    #password = db.Column(db.String(200), nullable=False)
    ## Relación con Photo, utiliza un back_populates único
    ##photos = db.relationship('Photo', back_populates='owner', lazy=True)
    #images = db.relationship('Image', back_populates='user', lazy=True)

#class Photo(db.Model):
    #__tablename__ = 'photos'

    #id = db.Column(db.Integer, primary_key=True)
    #user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    #file_path = db.Column(db.String(200), nullable=False)
    #uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    ## Relación con User, evita conflictos de nombres
    #owner = db.relationship('User', back_populates='photos')

#class Image(db.Model):
#    __tablename__ = 'images'
#
#    id = db.Column(db.Integer, primary_key=True)
#    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Relación con la tabla de usuarios
#    file_name = db.Column(db.String(255), nullable=False)  # Nombre del archivo
#    file_path = db.Column(db.String(500), nullable=False)  # Ruta del archivo
#    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Fecha y hora de carga
#
#
#    # Relación inversa con el usuario
#    user = db.relationship('User', back_populates='images')



class Album(db.Model):
    __tablename__ = 'albums'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relación con las fotos
    photos = db.relationship('Image', back_populates='album', lazy=True)

class Image(db.Model):
    __tablename__ = 'images'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relación con el álbum
    album_id = db.Column(db.Integer, db.ForeignKey('albums.id'), nullable=True)
    album = db.relationship('Album', back_populates='photos', lazy=True)

    # Relación con el usuario
    user = db.relationship('User', back_populates='images')


class Timeline(db.Model):
    __tablename__ = 'timelines'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    events = db.relationship('Event', back_populates='timeline', lazy=True)

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    timeline_id = db.Column(db.Integer, db.ForeignKey('timelines.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(255), nullable=False)

    timeline = db.relationship('Timeline', back_populates='events')
