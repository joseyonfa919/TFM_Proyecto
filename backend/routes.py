from datetime import datetime, timedelta
from flask import Blueprint, Response, app, request, jsonify, send_file
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity,verify_jwt_in_request
from models import Photo, db, User
import os
from werkzeug.utils import secure_filename
from flask import current_app



api_bp = Blueprint('api', __name__)



@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password']).decode('utf-8')
    new_user = User(name=data['name'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@api_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data['email']
        password = data['password']

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            # Generar un token JWT
            access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))
            print(f"Access Token generado: {access_token}") 
            return jsonify({"token": access_token}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "An error occurred"}), 500
    

@api_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"message": "Password reset instructions sent!"}), 200

@api_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    try:
        print("=== Iniciando subida de imagen ===")

        # Verificar el token JWT y obtener el ID del usuario
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        print(f"Usuario autenticado con ID: {current_user_id}")

        # Verificar si se envió un archivo
        if 'file' not in request.files:
            print("Error: No se encontró el archivo en la solicitud")
            return jsonify({"message": "No file provided"}), 400

        file = request.files['file']
        print(f"Archivo recibido: {file.filename}")

        # Validar que el archivo tenga un nombre válido
        if file.filename == '':
            print("Error: No se seleccionó un archivo válido")
            return jsonify({"message": "No selected file"}), 400

        # Guardar el archivo en la carpeta 'uploads'
        filename = secure_filename(file.filename)
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, filename)
        os.makedirs(upload_folder, exist_ok=True)
        file.save(file_path)
        print(f"Archivo guardado en la carpeta: {file_path}")

        # Guardar la información en la base de datos
        new_photo = Photo(
            user_id=current_user_id,
            file_path=file_path,  # Ruta del archivo
            uploaded_at=datetime.utcnow()  # Fecha de subida
        )
        print(f"Creando objeto Photo: user_id={new_photo.user_id}, file_path={new_photo.file_path}")

        db.session.add(new_photo)
        db.session.commit()
        print("Foto guardada en la base de datos con éxito")

        return jsonify({"message": "Image uploaded successfully", "path": file_path}), 200

    except Exception as e:
        print(f"Error durante la subida de imagen: {str(e)}")
        return jsonify({"message": "Error processing request"}), 500
    
    
#@api_bp.route('/photos', methods=['GET'])
#@app.route('/photos', methods=['GET'])


@api_bp.route('/photos', methods=['GET'])
@jwt_required()
def get_photos():
    try:
        user_id = get_jwt_identity()  # Obtener el user_id directamente del token
        print(f"User ID: {user_id}")
        photos = Photo.query.filter_by(user_id=user_id).all()
        if not photos:
            return jsonify([]), 200  # Devuelve una lista vacía si no hay fotos

        return jsonify([
            {
                'id': photo.id,
                'file_path': photo.file_path,
                'uploaded_at': photo.uploaded_at.isoformat()
            } for photo in photos
        ]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/photos/<int:photo_id>', methods=['GET'])
@jwt_required()
def view_photo(photo_id):
    current_user_id = get_jwt_identity()
    
    # Buscar la foto por ID y validar que pertenezca al usuario
    photo = Photo.query.filter_by(id=photo_id, user_id=current_user_id).first()
    if not photo:
        return jsonify({"message": "Photo not found or unauthorized"}), 404
    
    # Enviar el archivo de imagen
    return send_file(photo.file_path, mimetype='image/jpeg')
