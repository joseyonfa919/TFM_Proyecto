from datetime import timedelta
import bcrypt
from flask import Blueprint, request, jsonify, send_from_directory
from flask_bcrypt import check_password_hash
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity,verify_jwt_in_request
from models import db, User, Image, Album
import os
from werkzeug.utils import secure_filename
from flask import current_app
from flask_bcrypt import Bcrypt



api_bp = Blueprint('api', __name__)
bcrypt = Bcrypt()

#registro Usuarios
@api_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        # Verificar si el usuario ya existe
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "El usuario ya está registrado"}), 400

        # Crear un nuevo usuario
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(name=name, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Usuario registrado con éxito"}), 201
    except Exception as e:
        print(f"Error durante el registro: {e}", flush=True)
        return jsonify({"message": "Error durante el registro", "error": str(e)}), 500

#login - inicio de sesion
@api_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data['email']
        password = data['password']

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            # Generar un token JWT
            access_token = create_access_token(identity=user.id)
            print(f"Access Token generado: {access_token}") 
            #return jsonify({"token": access_token}), 200
            return jsonify({"token": access_token, "user_id": user.id}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "An error occurred"}), 500
    

#Recuperar contraseña
@api_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"message": "Password reset instructions sent!"}), 200


#subir fotos
@api_bp.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Obtener el user_id del cuerpo de la solicitud
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({"message": "User ID is required"}), 400

        # Verificar que se ha enviado un archivo
        if 'file' not in request.files:
            return jsonify({"message": "No file provided or invalid file"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Guardar el archivo en el servidor
        filename = secure_filename(file.filename)
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        # Crear un registro en la base de datos
        new_image = Image(
            user_id=int(user_id),  # Asegurarse de que sea un entero
            file_name=file.filename,
            file_path=file_path,
        )
        db.session.add(new_image)
        db.session.commit()

        return jsonify({"message": "Image uploaded successfully", "image_id": new_image.id}), 201
    except Exception as e:
        print(f"Error al subir imagen: {e}", flush=True)
        return jsonify({"message": "Error al procesar la solicitud", "error": str(e)}), 500
    
    
#@api_bp.route('/photos', methods=['GET'])
#@app.route('/photos', methods=['GET'])

#Ver Fotos
#@api_bp.route('/photos', methods=['GET'])
#@jwt_required()
@api_bp.route('/photos', methods=['GET'])
def get_photos():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400
    try:
        photos = Image.query.filter_by(user_id=int(user_id)).all()
        photo_list = [
            {
                'id': photo.id,
                'file_path': os.path.basename(photo.file_path),  # Solo el nombre del archivo
                'uploaded_at': photo.uploaded_at.isoformat()
            } for photo in photos
        ]
        return jsonify(photo_list), 200
    except Exception as e:
        print(f"Error al obtener fotos: {e}", flush=True)
        return jsonify({"message": "Error al obtener fotos", "error": str(e)}), 500



@api_bp.route('/uploads/<filename>')
def serve_file(filename):
    try:
        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"Error al servir la imagen: {e}", flush=True)
        return jsonify({"message": "Error al servir la imagen"}), 500


@api_bp.route('/albums', methods=['POST'])
@jwt_required()
def create_album():
    try:
        data = request.get_json()
        album_name = data.get('name')
        photo_ids = data.get('photo_ids')  # Lista de IDs de fotos seleccionadas

        if not album_name or not photo_ids:
            return jsonify({"message": "El nombre del álbum y las fotos son obligatorios"}), 400

        user_id = get_jwt_identity()

        # Crear el álbum
        new_album = Album(name=album_name, user_id=user_id)
        db.session.add(new_album)
        db.session.commit()

        # Asociar las fotos al álbum
        for photo_id in photo_ids:
            photo = Image.query.filter_by(id=photo_id, user_id=user_id).first()
            if photo:
                photo.album_id = new_album.id
        db.session.commit()

        return jsonify({"message": "Álbum creado con éxito", "album_id": new_album.id}), 201
    except Exception as e:
        print(f"Error al crear el álbum: {e}", flush=True)
        return jsonify({"message": "Error al crear el álbum", "error": str(e)}), 500


# Obtener álbumes del usuario autenticado
@api_bp.route('/albums', methods=['GET'])
@jwt_required()
def get_albums():
    try:
        user_id = get_jwt_identity()
        albums = Album.query.filter_by(user_id=user_id).all()

        album_list = [
            {
                "id": album.id,
                "name": album.name,
                "photos": [
                    {
                        "id": photo.id,
                        "file_name": photo.file_name,
                        "file_path": os.path.basename(photo.file_path)
                    } for photo in album.photos
                ]
            } for album in albums
        ]
        return jsonify(album_list), 200
    except Exception as e:
        print(f"Error al obtener los álbumes: {e}", flush=True)
        return jsonify({"message": "Error al obtener los álbumes", "error": str(e)}), 500