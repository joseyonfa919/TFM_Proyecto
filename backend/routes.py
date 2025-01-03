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
from flask_cors import CORS



api_bp = Blueprint('api', __name__)
bcrypt = Bcrypt()
CORS(api_bp)

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
            #print(f"Access Token generado: {access_token}") 
            #return jsonify({"token": access_token}), 200
            return jsonify({"token": access_token, "user_id": user.id, "name":user.name}), 200
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

        # Modificar el nombre del archivo para incluir el user_id
        filename = secure_filename(file.filename)
        filename_with_user_id = f"{user_id}_{filename}"

        # Guardar el archivo en el servidor
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, filename_with_user_id)
        file.save(file_path)

        # Crear un registro en la base de datos
        new_image = Image(
            user_id=int(user_id),  # Asegurarse de que sea un entero
            file_name=filename_with_user_id,
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
    user_id = request.args.get('user_id')  # Obtener el user_id del parámetro de consulta
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400

    photos = Image.query.filter_by(user_id=int(user_id)).all()
    photo_list = [
        {
            'id': photo.id,
            'file_name': photo.file_name,
            'file_path': f"/uploads/{os.path.basename(photo.file_path)}",  # Ruta relativa
            'uploaded_at': photo.uploaded_at.isoformat()
        } for photo in photos
    ]
    return jsonify(photo_list), 200


@api_bp.route('/uploads/<filename>')
def serve_file(filename):
    try:
        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"Error al servir la imagen: {e}", flush=True)
        return jsonify({"message": "Error al servir la imagen"}), 500



@api_bp.route('/albums', methods=['POST'])
def create_album():
    try:
        data = request.get_json()
        album_name = data.get('name')
        photo_ids = data.get('photo_ids')
        user_id = data.get('user_id')  # Obtener el user_id del cuerpo de la solicitud

        if not album_name or not photo_ids or not user_id:
            return jsonify({"message": "El nombre del álbum, las fotos y el ID del usuario son obligatorios"}), 400

        # Crear el álbum
        new_album = Album(name=album_name, user_id=int(user_id))
        db.session.add(new_album)
        db.session.commit()

        # Asociar las fotos al álbum
        for photo_id in photo_ids:
            photo = Image.query.filter_by(id=photo_id, user_id=int(user_id)).first()
            if photo:
                photo.album_id = new_album.id
        db.session.commit()

        return jsonify({"message": "Álbum creado con éxito", "album_id": new_album.id}), 201
    except Exception as e:
        print(f"Error al crear el álbum: {e}", flush=True)
        return jsonify({"message": "Error al crear el álbum", "error": str(e)}), 500


# Obtener álbumes del usuario autenticado
@api_bp.route('/albums', methods=['GET'])
def get_albums():
    try:
        user_id = request.args.get('user_id')  # Obtener el user_id del parámetro de consulta
        if not user_id:
            return jsonify({"message": "User ID is required"}), 400

        albums = Album.query.filter_by(user_id=int(user_id)).all()

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
    
@api_bp.route('/photos/delete', methods=['POST'])
def delete_photos():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        photo_ids = data.get('photo_ids')

        if not user_id or not photo_ids:
            return jsonify({"message": "User ID y photo_ids son obligatorios"}), 400

        # Verificar y eliminar fotos
        for photo_id in photo_ids:
            photo = Image.query.filter_by(id=photo_id, user_id=int(user_id)).first()
            if photo:
                # Eliminar archivo físico del servidor
                try:
                    os.remove(photo.file_path)
                except Exception as e:
                    print(f"Error al eliminar archivo físico: {e}", flush=True)
                # Eliminar registro de la base de datos
                db.session.delete(photo)

        db.session.commit()
        return jsonify({"message": "Fotos eliminadas con éxito"}), 200
    except Exception as e:
        print(f"Error al eliminar fotos: {e}", flush=True)
        return jsonify({"message": "Error al eliminar fotos", "error": str(e)}), 500
    

@api_bp.route('/albums/delete', methods=['POST'])
def delete_albums():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        album_ids = data.get('album_ids')

        if not user_id or not album_ids:
            return jsonify({"message": "User ID y album_ids son obligatorios"}), 400

        # Verificar y eliminar álbumes
        for album_id in album_ids:
            album = Album.query.filter_by(id=album_id, user_id=int(user_id)).first()
            if album:
                # Desasociar y eliminar fotos del álbum
                for photo in album.photos:
                    photo.album_id = None
                db.session.delete(album)

        db.session.commit()
        return jsonify({"message": "Álbumes eliminados con éxito"}), 200
    except Exception as e:
        print(f"Error al eliminar álbumes: {e}", flush=True)
        return jsonify({"message": "Error al eliminar álbumes", "error": str(e)}), 500


@api_bp.route('/change-password', methods=['POST'])  # Cambiado de PUT a POST
@jwt_required()
def change_password():
    try:
        # Verificar token y obtener usuario autenticado
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"message": "Token inválido o no proporcionado"}), 401
        print(f"Usuario autenticado: {user_id}", flush=True)

        # Obtener los datos del cuerpo de la solicitud
        data = request.get_json()
        print(f"Datos recibidos: {data}", flush=True)

        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({"message": "La contraseña actual y la nueva contraseña son obligatorias"}), 400

        # Verificar que el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
        print(f"Usuario encontrado: {user.email}", flush=True)

        # Verificar la contraseña actual
        if not check_password_hash(user.password, current_password):
            return jsonify({"message": "La contraseña actual es incorrecta"}), 401

        # Hashear la nueva contraseña y actualizar en la base de datos
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = hashed_password
        db.session.commit()

        return jsonify({"message": "Contraseña cambiada con éxito"}), 200

    except Exception as e:
        print(f"Error en el backend: {e}", flush=True)
        return jsonify({"message": "Error al cambiar la contraseña", "error": str(e)}), 500