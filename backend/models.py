from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
from flask import current_app

db = SQLAlchemy()
bcrypt = Bcrypt()




class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    # Relación con Photo, utiliza un back_populates único
    #photos = db.relationship('Photo', back_populates='owner', lazy=True)
    images = db.relationship('Image', back_populates='user', lazy=True)

#class Photo(db.Model):
    #__tablename__ = 'photos'

    #id = db.Column(db.Integer, primary_key=True)
    #user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    #file_path = db.Column(db.String(200), nullable=False)
    #uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    ## Relación con User, evita conflictos de nombres
    #owner = db.relationship('User', back_populates='photos')

class Image(db.Model):
    __tablename__ = 'images'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Relación con la tabla de usuarios
    file_name = db.Column(db.String(255), nullable=False)  # Nombre del archivo
    file_path = db.Column(db.String(500), nullable=False)  # Ruta del archivo
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Fecha y hora de carga


    # Relación inversa con el usuario
    user = db.relationship('User', back_populates='images')