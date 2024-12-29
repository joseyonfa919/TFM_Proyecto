from datetime import timedelta
from flask import Blueprint, request, jsonify, send_from_directory
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity,verify_jwt_in_request
from models import db, User, Image
import os
from werkzeug.utils import secure_filename
from flask import current_app



api_bp = Blueprint('api', __name__)


#registro Usuarios
@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password']).decode('utf-8')
    new_user = User(name=data['name'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

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
#@jwt_required()
#def upload_image():
def upload_file():
    try:
        current_user_id = get_jwt_identity()
        print(current_user_id)

        if 'file' not in request.files :#or request.files['file'].filename == '':
            return jsonify({"message": "No file provided or invalid file"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file:
            filename = secure_filename(file.filename)
            upload_folder = current_app.config['UPLOAD_FOLDER']
            file_path = os.path.join(upload_folder, filename)
            # Guardar archivo en el servidor
            file.save(file_path)
            # Crear registro en la base de datos
            new_image = Image(
                user_id=current_user_id,
                file_name=file.filename,
                file_path=file_path,
            )
            db.session.add(new_image)
            db.session.commit()
        return jsonify({"message": "Image uploaded successfully", "image_id": new_image.id}), 201
    except Exception as e:
        print(f"Error al subir imagen: {e}", flush=True)
        return jsonify({"message": "Error al procesar la solicitud"}), 500

    
    
#@api_bp.route('/photos', methods=['GET'])
#@app.route('/photos', methods=['GET'])

#Ver Fotos
@api_bp.route('/photos', methods=['GET'])
@jwt_required()
def get_photos():
    user_id = get_jwt_identity()
    photos = Image.query.filter_by(user_id=user_id).all()
    photo_list =[{'id': photo.id,
        'file_path': photo.file_path,
        'uploaded_at': photo.uploaded_at.isoformat()} for photo in photos]
    return jsonify(photo_list), 200

@api_bp.route('/uploads/<filename>')
@jwt_required()
def serve_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

