from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from platform import processor
from pyexpat import model
import smtplib
import uuid
import PIL
import bcrypt
from flask import Blueprint, request, jsonify, send_from_directory
from flask_bcrypt import check_password_hash
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity,verify_jwt_in_request
from models import Event, Timeline, db, User, Image, Album
import os
from werkzeug.utils import secure_filename
from flask import current_app
from flask_bcrypt import Bcrypt
from utils.ai_utils import preprocess_text, process_images_with_ai, cluster_images
from sklearn.cluster import KMeans
from PIL import Image as PILImage
import torch
import numpy as np
from transformers import CLIPProcessor, CLIPModel,pipeline
from utils.multimodal_utils import VoiceHandler, TextHandler
from utils.ai_utils import process_images_with_ai
from utils.ai_utils import calculate_similarity_with_text
from config import TEMP_AUDIO_DIR
import speech_recognition as sr
from pydub import AudioSegment
import soundfile as sf
import numpy as np
import io




api_bp = Blueprint('api', __name__)
bcrypt = Bcrypt()

voice_handler = VoiceHandler()
text_handler = TextHandler()

description_generator = pipeline("text-generation", model="gpt2")

# Cargar modelos CLIP
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Definir el directorio para guardar archivos de audio temporalmente
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_AUDIO_DIR = os.path.join(BASE_DIR, 'temp_audio')

PHOTO_DIR = "uploads"

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
@api_bp.route('/login', methods=['POST'])  # Ruta para manejar el inicio de sesión usando el método POST.
def login():
    try:
        # Obtiene los datos JSON enviados en la solicitud.
        data = request.json  
        
        # Extrae el email y la contraseña del cuerpo de la solicitud.
        email = data.get('email')
        password = data.get('password')

        # Busca un usuario en la base de datos con el email proporcionado.
        user = User.query.filter_by(email=email).first()

        # Verifica si el usuario existe en la base de datos.
        if not user:
            print("Usuario no encontrado")  # Mensaje para depuración.
            # Retorna una respuesta con un código de estado 401 (no autorizado) y un mensaje de error.
            return jsonify({'error': 'Usuario no encontrado'}), 401

        # Compara la contraseña proporcionada con la contraseña almacenada usando hashing.
        if not check_password_hash(user.password, password):
            print("Contraseña incorrecta")  # Mensaje para depuración.
            # Retorna una respuesta con un código de estado 401 y un mensaje de error.
            return jsonify({'error': 'Contraseña incorrecta'}), 401

        # Genera un token de acceso para el usuario autenticado.
        token = create_access_token(identity=user.id)

        # Retorna el token, el ID del usuario y su nombre en una respuesta con un código de estado 200 (éxito).
        return jsonify({'token': token, 'user_id': user.id, 'name': user.name}), 200
    except Exception as e:
        # Manejo de errores: captura cualquier excepción y retorna un mensaje de error genérico.
        print(f"Error durante login: {e}")  # Imprime el error para fines de depuración.
        return jsonify({'error': 'Error interno'}), 500  # Retorna un código de estado 500 (error interno).


    

#Recuperar contraseña
#@api_bp.route('/forgot-password', methods=['POST'])
#def forgot_password():
#    data = request.get_json()
#    user = User.query.filter_by(email=data['email']).first()
#    if not user:
#        return jsonify({"message": "User not found"}), 404
#    return jsonify({"message": "Password reset instructions sent!"}), 200


#subir fotos
@api_bp.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Obtener el user_id del formulario
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({"message": "User ID is required"}), 400

        # Verificar que se hayan enviado archivos
        if 'files' not in request.files:
            return jsonify({"message": "No files provided or invalid files"}), 400

        files = request.files.getlist('files')  # Obtener todos los archivos
        uploaded_files = []

        for file in files:
            if file.filename == '':
                continue

            # Asegurar nombres de archivos seguros
            filename = secure_filename(file.filename)
            filename_with_user_id = f"{user_id}_{filename}"

            # Guardar archivo en servidor
            upload_folder = current_app.config['UPLOAD_FOLDER']
            file_path = os.path.join(upload_folder, filename_with_user_id)
            file.save(file_path)

            # Registrar archivo en la base de datos
            new_image = Image(
                user_id=int(user_id),
                file_name=filename_with_user_id,
                file_path=file_path,
            )
            db.session.add(new_image)
            uploaded_files.append(filename_with_user_id)

        db.session.commit()

        return jsonify({"message": "Imágenes subidas con éxito", "uploaded_files": uploaded_files}), 201
    except Exception as e:
        print(f"Error al subir imágenes: {e}", flush=True)
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
    user_id = request.args.get('user_id')
    albums = Album.query.filter_by(user_id=user_id).all()
    album_list = [
        {
            "id": album.id,
            "name": album.name,
            "photos": [{"id": photo.id, "file_name": photo.file_name} for photo in album.photos]  # Agregar fotos
        }
        for album in albums
    ]
    return jsonify(album_list)
    
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
    
@api_bp.route('/albums/share', methods=['POST'])
def share_album():
    data = request.json
    album_id = data.get('album_id')
    user_id = data.get('user_id')

    if not album_id or not user_id:
        return jsonify({"message": "Faltan parámetros."}), 400

    # Generar un identificador único para compartir
    share_token = str(uuid.uuid4())

    # Aquí podrías guardar el enlace en la base de datos
    # Por ahora, solo devolvemos el token
    return jsonify({"share_link": f"http://localhost:3000/shared/{share_token}"}), 200

@api_bp.route('/change-password', methods=['POST'])
def change_password():
    try:
        # Obtener los datos enviados desde el frontend
        data = request.get_json()
        user_id = data.get('user_id')
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        # Buscar el usuario por el ID
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        # Verificar la contraseña actual
        if not check_password_hash(user.password, current_password):
            return jsonify({'error': 'La contraseña actual es incorrecta'}), 401

        # Actualizar la contraseña

        user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()

        return jsonify({'message': 'Contraseña actualizada correctamente'}), 200
    except Exception as e:
        print(f"Error al cambiar contraseña: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500


@api_bp.route('/albums/organize', methods=['POST'])
def organize_content():
    try:
        data = request.get_json()
        photos = data.get('photos', [])
        videos = data.get('videos', [])
        texts = data.get('texts', "")

        # Simulación: lógica de IA para organizar el contenido
        organized_content = {
            "sections": [
                {"title": "Fotos", "items": photos},
                {"title": "Videos", "items": videos},
                {"title": "Notas", "items": [texts]},
            ]
        }

        return jsonify({"organized_content": organized_content}), 200
    except Exception as e:
        print(f"Error en la organización de contenido: {e}")
        return jsonify({"error": "Error interno"}), 500

# routes.py
@api_bp.route('/organize/manual', methods=['POST'])
def organize_manual():
    try:
        data = request.get_json()
        photos = data.get('photos', [])
        videos = data.get('videos', [])
        notes = data.get('notes', [])

        # Organización básica manual
        organized_content = {
            "Fotos": photos,
            "Videos": videos,
            "Notas": notes
        }

        return jsonify({"organized_content": organized_content}), 200
    except Exception as e:
        print(f"Error en la organización manual: {e}")
        return jsonify({"error": "Error interno"}), 500




def ai_organize(photos, videos, notes):
    # Simulación de procesamiento basado en IA (a integrar con un modelo real)
    return {
        "Fotos organizadas por IA": photos,
        "Videos organizados por IA": videos,
        "Notas analizadas por IA": notes
    }

@api_bp.route('/organize/ai', methods=['POST'])
def organize_ai():
    try:
        data = request.get_json()
        photo_ids = data.get('photos', [])
        notes = data.get('notes', '')

        if not photo_ids:
            return jsonify({"error": "No se proporcionaron IDs de fotos"}), 400

        # Obtener imágenes desde la base de datos
        images = Image.query.filter(Image.id.in_(photo_ids)).all()
        if not images:
            return jsonify({"error": "No se encontraron imágenes con los IDs proporcionados"}), 404

        image_paths = [image.file_path for image in images if os.path.exists(image.file_path)]
        if not image_paths:
            return jsonify({"error": "No se encontraron rutas de imágenes válidas"}), 400

        # Procesar imágenes y notas con IA
        analysis_results = process_images_with_ai(image_paths, notes)
        organized_content = cluster_images(analysis_results)

        return jsonify({"organized_content": organized_content}), 200
    except Exception as e:
        print(f"Error en organización por IA: {e}")
        return jsonify({"error": "Error interno", "details": str(e)}), 500

@api_bp.route('/albums/suggestions', methods=['POST'])
def suggest_albums_with_ai():
    try:
        data = request.get_json()
        photo_ids = data.get('photo_ids', [])
        user_id = data.get('user_id')

        # Depuración
        print(f"Photo IDs recibidos: {photo_ids}")
        print(f"User ID recibido: {user_id}")

        if not photo_ids:
            return jsonify({"error": "No se proporcionaron fotos para sugerencias"}), 400

        # Obtener las imágenes de la base de datos
        images = Image.query.filter(Image.id.in_(photo_ids)).all()
        if not images:
            return jsonify({"error": "No se encontraron fotos con los IDs proporcionados"}), 404

        image_paths = [image.file_path for image in images if os.path.exists(image.file_path)]
        if not image_paths:
            return jsonify({"error": "No se encontraron rutas de imágenes válidas"}), 400

        # Modelo y procesador CLIP
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

        # Procesar imágenes y extraer características
        features = []
        for path in image_paths:
            try:
                pil_image = PILImage.open(path).convert("RGB")  # Convertir a formato RGB
                inputs = processor(images=pil_image, return_tensors="pt")
                outputs = model.get_image_features(**inputs)  # Extraer características
                features.append(outputs.detach().numpy().flatten())  # Asegurar que sea un vector 1D
            except Exception as e:
                print(f"Error al procesar la imagen {path}: {e}", flush=True)
                continue

        # Validar características
        if len(features) < 2:
            return jsonify({"error": "Se necesitan al menos 2 fotos para generar sugerencias"}), 400

        features = np.array(features)  # Convertir a array de numpy
        print(f"Shape de las features: {features.shape}")

        # Clustering con KMeans
        n_clusters = min(len(features), 3)
        kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(features)
        labels = kmeans.labels_

        # Generar sugerencias
        suggestions = []
        for cluster_id in set(labels):
            cluster_images = [images[i] for i in range(len(labels)) if labels[i] == cluster_id]
            if cluster_images:
                suggestions.append({
                    "album_name": f"Álbum {cluster_id + 1}",
                    "photo_ids": [img.id for img in cluster_images]
                })

        return jsonify({"suggestions": suggestions}), 200
    except Exception as e:
        print(f"Error generando sugerencias de álbumes: {e}", flush=True)
        return jsonify({"error": "Error interno", "details": str(e)}), 500

@api_bp.route('/albums/suggest-auto', methods=['POST'])
def suggest_albums_auto():
    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({"error": "Se requiere el ID del usuario"}), 400

        # Obtener todas las fotos del usuario
        images = Image.query.filter_by(user_id=user_id).all()
        if not images:
            return jsonify({"error": "No se encontraron fotos para este usuario"}), 404

        image_paths = [image.file_path for image in images if os.path.exists(image.file_path)]
        if not image_paths:
            return jsonify({"error": "No se encontraron rutas de imágenes válidas"}), 400

        # Procesar imágenes con CLIP
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

        features = []
        for path in image_paths:
            try:
                pil_image = PILImage.open(path).convert("RGB")
                inputs = processor(images=pil_image, return_tensors="pt")
                outputs = model.get_image_features(**inputs)
                features.append(outputs.detach().numpy().flatten())
            except Exception as e:
                print(f"Error procesando la imagen {path}: {e}")
                continue

        if len(features) < 2:
            return jsonify({"error": "Se necesitan al menos 2 fotos para generar sugerencias"}), 400

        features = np.array(features)

        # Clustering con KMeans
        n_clusters = min(len(features), 3)
        kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(features)
        labels = kmeans.labels_

        # Generar nombres automáticos con IA
        suggestions = []
        for cluster_id in set(labels):
            cluster_images = [images[i] for i in range(len(labels)) if labels[i] == cluster_id]
            if cluster_images:
                # Usar CLIP para obtener texto descriptivo
                cluster_features = [features[i] for i in range(len(labels)) if labels[i] == cluster_id]
                aggregated_features = np.mean(cluster_features, axis=0)
                generated_name = f"Álbum IA {cluster_id + 1}"  # Personalizar aquí
                suggestions.append({
                    "album_name": generated_name,
                    "photo_ids": [img.id for img in cluster_images],
                    "photos": [{"id": img.id, "file_name": img.file_name, "file_path": img.file_path} for img in cluster_images]
                })

        return jsonify({"suggestions": suggestions}), 200
    except Exception as e:
        print(f"Error generando sugerencias automáticas: {e}", flush=True)
        return jsonify({"error": "Error interno", "details": str(e)}), 500


def send_email(to_email, subject, body):
    try:
        sender_email = "recuerdosprototipo@gmail.com"  # Reemplázalo con tu correo
        sender_password = "rnweattpnnzjibbc"  # Reemplázalo con tu contraseña
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        # Configurar el mensaje
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))
        # Conectar al servidor de correo
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Habilitar encriptación TLS
        server.login(sender_email, sender_password)
        # Enviar el correo
        server.sendmail(sender_email, to_email, message.as_string())
        server.quit()
        print("Correo enviado exitosamente")
        return True
    except Exception as e:
        print(f"Error al enviar el correo: {e}")
        return False
    
@api_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        # Obtener email del cuerpo de la solicitud
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({"message": "El correo electrónico es obligatorio"}), 400
        # Verificar si el usuario existe
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "El usuario no existe"}), 404
        # Generar un token único y fecha de expiración
        reset_token = str(uuid.uuid4())
        expiration_time = datetime.utcnow() + timedelta(hours=1)  # El token expira en 1 hora
        # Almacenar el token y la fecha de expiración en el usuario
        user.reset_token = reset_token
        user.reset_token_expiration = expiration_time
        db.session.commit()

        # Crear enlace de restablecimiento de contraseña
        reset_link = f"http://localhost:3000/reset-password/{reset_token}"
        # Enviar el enlace por correo
        subject = "Recuperación de contraseña"
        body = f"""Hola {user.name},\n\n
        Haz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_link}\n\n
        Este enlace es válido por 1 hora. Si no solicitaste esto, ignora este correo."""
        email_sent = send_email(email, subject, body)
        if not email_sent:
            return jsonify({"message": "Error al enviar el correo"}), 500
        return jsonify({"message": "Instrucciones para restablecer la contraseña enviadas al correo proporcionado"}), 200
    except Exception as e:
        print(f"Error en la recuperación de contraseña: {e}")
        return jsonify({"message": "Error interno del servidor"}), 500
    
@api_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        reset_token = data.get('token')
        new_password = data.get('new_password')
        if not reset_token or not new_password:
            return jsonify({'error': 'El token y la nueva contraseña son obligatorios'}), 400
        # Buscar al usuario por el token
        user = User.query.filter_by(reset_token=reset_token).first()
        if not user:
            return jsonify({'error': 'Token inválido o usuario no encontrado'}), 404
        # Verificar que el token no haya expirado
        if user.reset_token_expiration < datetime.utcnow():
            return jsonify({'error': 'El token ha expirado'}), 400
        # Actualizar la contraseña y eliminar el token
        user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.reset_token = None  # Eliminar el token después de usarlo
        user.reset_token_expiration = None
        db.session.commit()
        return jsonify({'message': 'Contraseña restablecida correctamente'}), 200
    except Exception as e:
        print(f"Error en reset_password: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500
    

@api_bp.route('/process-text', methods=['POST'])
def process_text():
    try:
        data = request.get_json()
        input_text = data.get("text", "").lower()
        print(f"Text received: {input_text}")

        if not input_text:
            return jsonify({"message": "El texto está vacío."}), 400

        photos = []
        for photo_file in os.listdir(PHOTO_DIR):
            photo_path = os.path.join(PHOTO_DIR, photo_file)
            try:
                similarity = calculate_similarity_with_text(clip_model, clip_processor, input_text, photo_path)
                print(f"Similarity calculated for {photo_file}: {similarity}")
                if similarity > 0.3:  # Adjust the threshold as needed
                    #photos.append({"url": f"/uploads/{photo_file}", "name": photo_file, "score": similarity})
                    photos.append({"url": f"/uploads/{os.path.basename(photo_path)}", "name": photo_file, "score": similarity})
                    
            except Exception as e:
                print(f"Error processing image {photo_file}: {e}")

        if photos:
            return jsonify({"photos": photos}), 200
        else:
            return jsonify({"message": "No se encontraron fotos relacionadas."}), 200

    except Exception as e:
        print(f"Error processing text: {e}")
        return jsonify({"error": "Error interno", "details": str(e)}), 500

    


@api_bp.route('/process-voice', methods=['POST'])
def process_voice():
    try:
        print("Solicitud recibida en /process-voice")

        if 'audio' not in request.files or 'user_id' not in request.form:
            print("Faltan datos: archivo de audio o user_id")
            return jsonify({"error": "Faltan datos (audio o user_id)."}), 400

        audio_file = request.files['audio']
        user_id = request.form['user_id']
        print(f"Archivo recibido: {audio_file.filename}, User ID: {user_id}")

        if not os.path.exists(TEMP_AUDIO_DIR):
            os.makedirs(TEMP_AUDIO_DIR)

        wav_path = os.path.join(TEMP_AUDIO_DIR, f"{user_id}_audio.wav")
        audio_file.save(wav_path)
        print(f"Audio guardado en: {wav_path}")

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            print("Cargando audio para transcripción...")
            audio_data = recognizer.record(source)
            try:
                transcription = recognizer.recognize_google(audio_data, language="es-ES")
                print(f"Transcripción obtenida: {transcription}")
            except Exception as e:
                print(f"Error en la transcripción: {e}")
                transcription = "No se pudo transcribir el audio."

        return jsonify({"message": "Audio procesado con éxito", "transcription": transcription}), 200
    except Exception as e:
        print(f"Error procesando el audio: {e}")
        return jsonify({"error": "Error interno procesando el audio", "details": str(e)}), 500



    
@api_bp.route('/timelines/create', methods=['POST'])
def create_timeline():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        name = data.get('name', 'Mi Cronología')
        events = data.get('events', [])

        if not user_id or not events:
            return jsonify({"error": "User ID y eventos son obligatorios"}), 400

        # Crear la cronología
        timeline = Timeline(name=name, user_id=user_id)
        db.session.add(timeline)
        db.session.commit()

        # Añadir eventos
        for event in events:
            new_event = Event(
                timeline_id=timeline.id,
                photo_id=event.get('photo_id'),
                description=event.get('description'),
                date=datetime.strptime(event.get('date'), '%Y-%m-%d')
            )
            db.session.add(new_event)
        
        db.session.commit()
        return jsonify({"message": "Cronología creada exitosamente", "timeline_id": timeline.id}), 201

    except Exception as e:
        print(f"Error creando la cronología: {e}")
        return jsonify({"error": "Error interno"}), 500


@api_bp.route('/timelines', methods=['GET'])
def get_timelines():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID es obligatorio"}), 400

        timelines = Timeline.query.filter_by(user_id=user_id).all()
        timeline_list = [
            {
                "id": timeline.id,
                "name": timeline.name,
                "created_at": timeline.created_at.strftime('%Y-%m-%d') if timeline.created_at else None,
                "events": sorted(
                    [
                        {
                            "id": event.id,
                            "photo_path": f"/uploads/{os.path.basename(event.image.file_path)}" if event.image else None,
                            "description": event.description,
                            "date": event.date.strftime('%Y-%m-%d')
                        } 
                        for event in timeline.events
                    ], 
                    key=lambda x: x["date"]  # 🔴 Ordenar por fecha ascendente
                )
            }
            for timeline in timelines
        ]

        return jsonify({"timelines": timeline_list}), 200
    except Exception as e:
        print(f"Error obteniendo cronologías: {e}")
        return jsonify({"error": "Error interno"}), 500




@api_bp.route('/timelines/delete', methods=['POST'])
def delete_timeline():
    try:
        data = request.get_json()
        timeline_id = data.get('timeline_id')

        if not timeline_id:
            return jsonify({"error": "Timeline ID es obligatorio"}), 400

        timeline = Timeline.query.get(timeline_id)
        if not timeline:
            return jsonify({"error": "Cronología no encontrada"}), 404

        db.session.delete(timeline)
        db.session.commit()

        return jsonify({"message": "Cronología eliminada con éxito"}), 200
    except Exception as e:
        print(f"Error eliminando cronología: {e}")
        return jsonify({"error": "Error interno"}), 500



@api_bp.route('/timelines/describe', methods=['POST'])
def describe_event():
    try:
        data = request.get_json()
        photo_id = data.get('photo_id')
        keywords = data.get('keywords', [])

        if not photo_id or not keywords:
            return jsonify({"error": "Photo ID y palabras clave son obligatorios"}), 400

        # Generar narrativa
        prompt = f"Genera una descripción sobre un evento relacionado con {' '.join(keywords)}."
        description = description_generator(prompt, max_length=50)[0]['generated_text']

        return jsonify({"description": description}), 200
    except Exception as e:
        print(f"Error generando descripción: {e}")
        return jsonify({"error": "Error interno"}), 500
    

@api_bp.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    try:
        return send_from_directory("uploads", filename)
    except Exception as e:
        print(f"Error al servir la imagen: {e}", flush=True)
        return jsonify({"error": "No se pudo cargar la imagen"}), 500


@api_bp.route('/timelines/create_from_album', methods=['POST'])
def create_timeline_from_album():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        album_id = data.get('album_id')
        photo_ids = data.get('photo_ids', [])  # Lista de fotos seleccionadas

        if not user_id or not album_id or not photo_ids:
            return jsonify({"error": "Faltan parámetros o fotos no seleccionadas"}), 400

        # Obtener el álbum
        album = Album.query.filter_by(id=album_id, user_id=user_id).first()
        if not album:
            return jsonify({"error": "Álbum no encontrado"}), 404

        # Crear la nueva cronología
        new_timeline = Timeline(name=f"Cronología de {album.name}", user_id=user_id)
        db.session.add(new_timeline)
        db.session.commit()

        # Asociar las fotos seleccionadas a la cronología
        for photo_id in photo_ids:
            photo = Image.query.filter_by(id=photo_id, album_id=album_id).first()
            if photo:
                new_event = Event(
                    timeline_id=new_timeline.id,
                    photo_path=photo.file_path,
                    date=photo.upload_date,
                    description=f"Imagen de {album.name}"
                )
                db.session.add(new_event)

        db.session.commit()

        return jsonify({"message": "Cronología creada con éxito", "timeline_id": new_timeline.id}), 201

    except Exception as e:
        print(f"Error creando la cronología: {e}")
        return jsonify({"error": "Error interno"}), 500


@api_bp.route('/timelines/albums', methods=['GET'])
def get_albums_for_timelines():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID es obligatorio"}), 400

        albums = Album.query.filter_by(user_id=int(user_id)).all()
        album_list = [
            {
                "id": album.id,
                "name": album.name,
                "photos": [
                    {
                        "id": photo.id,
                        "file_name": photo.file_name,
                        "file_path": f"/uploads/{os.path.basename(photo.file_path)}"
                    } for photo in album.photos
                ]
            } for album in albums
        ]

        return jsonify(album_list), 200
    except Exception as e:
        print(f"Error obteniendo álbumes para cronología: {e}")
        return jsonify({"error": "Error interno"}), 500
