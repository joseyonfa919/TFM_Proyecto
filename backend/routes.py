from datetime import datetime, timedelta  # Manejo de fechas y tiempos
from email.mime.multipart import MIMEMultipart  # Creación de correos electrónicos con múltiples partes
from email.mime.text import MIMEText  # Manejo de texto dentro de correos electrónicos
from platform import processor  # Información sobre el procesador del sistema
from pyexpat import model  # Análisis y validación de XML (posiblemente no necesario aquí)
import smtplib  # Envío de correos electrónicos a través de SMTP
import uuid  # Generación de identificadores únicos
import PIL  # Manejo de imágenes
import bcrypt  # Encriptación de contraseñas

from flask import Blueprint, request, jsonify, send_from_directory, current_app  # Funcionalidades de Flask
from flask_bcrypt import check_password_hash, Bcrypt  # Manejo de contraseñas en Flask
from flask_jwt_extended import (  # Manejo de autenticación con JWT (tokens de sesión)
    create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
)

# Importación de modelos de base de datos
from models import Event, Timeline, db, User, Image, Album

import os  # Manejo de archivos y directorios
from werkzeug.utils import secure_filename  # Seguridad en nombres de archivos

# Importación de utilidades de IA y procesamiento multimodal
from utils.ai_utils import extract_frames, generate_image_descriptions, optimal_kmeans, preprocess_text, process_images_with_ai, cluster_images, calculate_similarity_with_text
from utils.multimodal_utils import VoiceHandler, TextHandler

# Algoritmo de agrupamiento de imágenes basado en características extraídas con IA
from sklearn.cluster import KMeans

# Librerías para el procesamiento de imágenes con IA
from PIL import Image as PILImage
import torch  # Librería para cálculos en GPU y modelos de aprendizaje profundo
import numpy as np  # Manipulación de datos numéricos y matrices

# Modelos de IA para procesamiento de imágenes y generación de texto
from transformers import CLIPProcessor, CLIPModel, pipeline

# Librerías para reconocimiento de voz y conversión de audio
import speech_recognition as sr  # Reconocimiento de voz
from pydub import AudioSegment  # Manejo y conversión de archivos de audio
import soundfile as sf  # Manipulación avanzada de archivos de audio
import io  # Manejo de flujos de datos en memoria

# Importación de configuración global de la aplicación
from config import TEMP_AUDIO_DIR

# Creación del Blueprint para manejar las rutas de la API
api_bp = Blueprint('api', __name__)
bcrypt = Bcrypt()  # Inicialización del manejador de encriptación de contraseñas

# Inicialización de los manejadores de voz y texto para procesamiento multimodal
voice_handler = VoiceHandler()
text_handler = TextHandler()

# Inicialización del modelo de generación de descripciones basado en IA
description_generator = pipeline("text-generation", model="gpt2")

# Cargar modelos CLIP para análisis de imágenes y extracción de características
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Definir directorios para almacenamiento de archivos multimedia
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Ruta base del proyecto
TEMP_AUDIO_DIR = os.path.join(BASE_DIR, 'temp_audio')  # Directorio temporal para almacenar audios
PHOTO_DIR = "uploads"  # Directorio donde se almacenan las imágenes subidas

# =========================== REGISTRO DE USUARIOS ===========================
@api_bp.route('/register', methods=['POST'])
def register():
    """
    Maneja el registro de nuevos usuarios.

    Recibe una solicitud POST con los datos del usuario en formato JSON.
    Verifica si el usuario ya existe en la base de datos.
    Si no existe, crea un nuevo usuario con la contraseña encriptada y lo almacena en la base de datos.

    Retorna:
        - 201 (Created): Si el usuario fue registrado exitosamente.
        - 400 (Bad Request): Si algún campo obligatorio está vacío o si el usuario ya está registrado.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos del cuerpo de la solicitud
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        # Validación: Todos los campos son obligatorios
        if not name or not email or not password:
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        # Verificar si el usuario ya existe en la base de datos
        if User.query.filter_by(email=email).first():
            return jsonify({"message": "El usuario ya está registrado"}), 400

        # Crear un nuevo usuario con contraseña encriptada
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(name=name, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Usuario registrado con éxito"}), 201
    except Exception as e:
        print(f"Error durante el registro: {e}", flush=True)
        return jsonify({"message": "Error durante el registro", "error": str(e)}), 500


# =========================== INICIO DE SESIÓN ===========================
@api_bp.route('/login', methods=['POST'])
def login():
    """
    Maneja el inicio de sesión de usuarios.

    Recibe una solicitud POST con el email y la contraseña del usuario.
    Verifica si el usuario existe y si la contraseña ingresada es correcta.
    Si la autenticación es exitosa, genera y retorna un token de acceso JWT.

    Retorna:
        - 200 (OK): Si el inicio de sesión fue exitoso, devuelve el token de acceso.
        - 401 (Unauthorized): Si el usuario no existe o la contraseña es incorrecta.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos JSON de la solicitud
        data = request.json  

        # Extraer el email y la contraseña del cuerpo de la solicitud
        email = data.get('email')
        password = data.get('password')

        # Buscar al usuario en la base de datos por email
        user = User.query.filter_by(email=email).first()

        # Si el usuario no existe, retornar un error
        if not user:
            print("Usuario no encontrado")  # Mensaje de depuración en consola
            return jsonify({'error': 'Usuario no encontrado'}), 401

        # Verificar si la contraseña ingresada es correcta
        if not check_password_hash(user.password, password):
            print("Contraseña incorrecta")  # Mensaje de depuración en consola
            return jsonify({'error': 'Contraseña incorrecta'}), 401

        # Generar un token de acceso para el usuario autenticado
        token = create_access_token(identity=user.id)

        # Retornar la respuesta con el token, el ID del usuario y su nombre
        return jsonify({'token': token, 'user_id': user.id, 'name': user.name}), 200
    except Exception as e:
        # Capturar cualquier error inesperado y retornar un mensaje genérico
        print(f"Error durante login: {e}")  # Imprime el error en la consola para depuración
        return jsonify({'error': 'Error interno'}), 500  # Retorna un error de servidor

    

#Recuperar contraseña
#@api_bp.route('/forgot-password', methods=['POST'])
#def forgot_password():
#    data = request.get_json()
#    user = User.query.filter_by(email=data['email']).first()
#    if not user:
#        return jsonify({"message": "User not found"}), 404
#    return jsonify({"message": "Password reset instructions sent!"}), 200

# =========================== SUBIDA DE FOTOS ===========================
@api_bp.route('/upload', methods=['POST'])
def upload_file():
    """
    Maneja la subida de imágenes por parte del usuario.

    Recibe una solicitud POST con imágenes adjuntas y el ID del usuario.
    Valida que los archivos sean proporcionados y los almacena en el servidor.
    Luego, registra los archivos en la base de datos con el ID del usuario.

    Retorna:
        - 201 (Created): Si las imágenes se suben exitosamente.
        - 400 (Bad Request): Si faltan datos o los archivos son inválidos.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener el ID del usuario desde el formulario
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({"message": "User ID es obligatorio"}), 400

        # Verificar que se hayan enviado archivos en la solicitud
        if 'files' not in request.files:
            return jsonify({"message": "No se han proporcionado archivos o son inválidos"}), 400

        files = request.files.getlist('files')  # Obtener la lista de archivos enviados
        uploaded_files = []  # Lista para almacenar los nombres de archivos subidos

        for file in files:
            # Si el archivo no tiene nombre, se ignora
            if file.filename == '':
                continue

            # Asegurar un nombre de archivo seguro para evitar problemas de seguridad
            filename = secure_filename(file.filename)
            filename_with_user_id = f"{user_id}_{filename}"  # Agregar el ID del usuario al nombre del archivo

            # Definir la ruta de almacenamiento en el servidor
            upload_folder = current_app.config['UPLOAD_FOLDER']
            file_path = os.path.join(upload_folder, filename_with_user_id)

            # Guardar el archivo en el servidor
            file.save(file_path)

            # Registrar el archivo en la base de datos asociándolo con el usuario
            new_image = Image(
                user_id=int(user_id),
                file_name=filename_with_user_id,
                file_path=file_path,
            )
            db.session.add(new_image)
            uploaded_files.append(filename_with_user_id)  # Agregar el nombre del archivo a la lista

        db.session.commit()  # Guardar los cambios en la base de datos

        # Respuesta exitosa con la lista de archivos subidos
        return jsonify({"message": "Imágenes subidas con éxito", "uploaded_files": uploaded_files}), 201
    except Exception as e:
        # Manejo de errores: Captura cualquier excepción y retorna un mensaje de error
        print(f"Error al subir imágenes: {e}", flush=True)
        return jsonify({"message": "Error al procesar la solicitud", "error": str(e)}), 500

    
# =========================== VER FOTOS ===========================
@api_bp.route('/photos', methods=['GET'])
def get_photos():
    """
    Obtiene la lista de fotos subidas por un usuario específico.

    Recibe una solicitud GET con el parámetro 'user_id' en la URL.
    Recupera todas las fotos asociadas al usuario desde la base de datos.

    Retorna:
        - 200 (OK): Lista de fotos del usuario.
        - 400 (Bad Request): Si no se proporciona el ID del usuario.
    """
    # Obtener el user_id del parámetro de consulta
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "User ID es obligatorio"}), 400

    # Consultar todas las fotos y videos asociadas al usuario en la base de datos
    photos = Image.query.filter_by(user_id=int(user_id)).all()
    valid_photos = []

    # Construir una lista con la información de cada foto
    for photo in photos:
        if os.path.exists(photo.file_path):  # Asegurar que la imagen realmente existe
            valid_photos.append({
                'id': photo.id,
                'file_name': photo.file_name,
                'file_path': f"/uploads/{os.path.basename(photo.file_path)}",
                'uploaded_at': photo.uploaded_at.isoformat()
            })
        else:
            print(f"⚠️ Imagen no encontrada en el servidor: {photo.file_path}")

    return jsonify(valid_photos), 200  # Retornar la lista de fotos en formato JSON


# =========================== SERVIR ARCHIVOS (IMÁGENES) ===========================
@api_bp.route('/uploads/<filename>')
def serve_file(filename):
    """
    Sirve archivos estáticos (imágenes) almacenados en el servidor.

    Recibe una solicitud GET con el nombre del archivo en la URL.
    Busca el archivo en el directorio de uploads y lo envía como respuesta.

    Retorna:
        - 200 (OK): El archivo solicitado.
        - 500 (Internal Server Error): Si ocurre un error al recuperar el archivo.
    """
    try:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)

        # Determinar el tipo MIME correcto
        if filename.endswith(('.mp4', '.webm', '.ogg')):
            mimetype = 'video/mp4' if filename.endswith('.mp4') else 'video/webm'
        elif filename.endswith(('.jpg', '.jpeg', '.png', '.gif')):
            mimetype = 'image/jpeg' if filename.endswith('.jpg') else 'image/png'
        else:
            mimetype = 'application/octet-stream'  # Tipo genérico para otros archivos

        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename, mimetype=mimetype)
    except Exception as e:
        print(f"Error al servir el archivo: {e}", flush=True)
        return jsonify({"message": "Error al servir el archivo"}), 500


# =========================== CREACIÓN DE ÁLBUMES ===========================
@api_bp.route('/albums', methods=['POST'])
def create_album():
    """
    Crea un álbum con las fotos seleccionadas por el usuario.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'name': Nombre del álbum.
    - 'photo_ids': Lista de IDs de fotos que pertenecen al álbum.
    - 'user_id': ID del usuario propietario del álbum.

    Retorna:
        - 201 (Created): Si el álbum se crea exitosamente.
        - 400 (Bad Request): Si falta algún dato obligatorio.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos del cuerpo de la solicitud
        data = request.get_json()
        album_name = data.get('name')
        photo_ids = data.get('photo_ids')
        user_id = data.get('user_id')

        # Validar que se proporcionaron todos los datos requeridos
        if not album_name or not photo_ids or not user_id:
            return jsonify({"message": "El nombre del álbum, las fotos y el ID del usuario son obligatorios"}), 400

        # Crear un nuevo álbum en la base de datos
        new_album = Album(name=album_name, user_id=int(user_id))
        db.session.add(new_album)
        db.session.commit()

        # Asociar las fotos seleccionadas al álbum recién creado
        for photo_id in photo_ids:
            photo = Image.query.filter_by(id=photo_id, user_id=int(user_id)).first()
            if photo:
                photo.album_id = new_album.id  # Asignar el álbum a la foto
        db.session.commit()

        return jsonify({"message": "Álbum creado con éxito", "album_id": new_album.id}), 201
    except Exception as e:
        # Manejo de errores en caso de problemas con la base de datos u otra excepción
        print(f"Error al crear el álbum: {e}", flush=True)
        return jsonify({"message": "Error al crear el álbum", "error": str(e)}), 500

# =========================== OBTENER ÁLBUMES DEL USUARIO ===========================
@api_bp.route('/albums', methods=['GET'])
def get_albums():
    """
    Obtiene la lista de álbumes creados por un usuario específico.

    Recibe una solicitud GET con el parámetro 'user_id' en la URL.
    Recupera todos los álbumes asociados al usuario desde la base de datos,
    junto con las fotos contenidas en cada álbum.

    Retorna:
        - 200 (OK): Lista de álbumes del usuario.
        - 400 (Bad Request): Si no se proporciona el ID del usuario.
    """
    # Obtener el ID del usuario desde los parámetros de la URL
    user_id = request.args.get('user_id')
    
    # Validar que se haya proporcionado un user_id
    if not user_id:
        return jsonify({"error": "User ID es obligatorio"}), 400

    # Consultar todos los álbumes del usuario en la base de datos
    albums = Album.query.filter_by(user_id=user_id).all()

    # Construir una lista con la información de cada álbum y sus fotos
    album_list = [
        {
            "id": album.id,
            "name": album.name,
            "photos": [{"id": photo.id, "file_name": photo.file_name} for photo in album.photos]  # Lista de fotos por álbum
        }
        for album in albums
    ]

    return jsonify(album_list)  # Retornar la lista de álbumes en formato JSON


# =========================== ELIMINAR FOTOS ===========================
@api_bp.route('/photos/delete', methods=['POST'])
def delete_photos():
    """
    Elimina fotos del usuario tanto de la base de datos como del servidor.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'user_id': ID del usuario propietario de las fotos.
    - 'photo_ids': Lista de IDs de las fotos a eliminar.

    Retorna:
        - 200 (OK): Si las fotos se eliminaron exitosamente.
        - 400 (Bad Request): Si falta algún dato obligatorio.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos enviados en la solicitud
        data = request.get_json()
        user_id = data.get('user_id')
        photo_ids = data.get('photo_ids')

        # Validar que se proporcionaron todos los datos requeridos
        if not user_id or not photo_ids:
            return jsonify({"message": "User ID y photo_ids son obligatorios"}), 400

        # Recorrer la lista de IDs de fotos a eliminar
        for photo_id in photo_ids:
            # Buscar la foto en la base de datos
            photo = Image.query.filter_by(id=photo_id, user_id=int(user_id)).first()
            if photo:
                # Intentar eliminar el archivo físico del servidor
                try:
                    os.remove(photo.file_path)
                except Exception as e:
                    print(f"Error al eliminar archivo físico: {e}", flush=True)

                # Eliminar el registro de la foto en la base de datos
                db.session.delete(photo)

        db.session.commit()  # Guardar los cambios en la base de datos

        return jsonify({"message": "Fotos eliminadas con éxito"}), 200
    except Exception as e:
        # Manejo de errores en caso de problemas con la base de datos u otra excepción
        print(f"Error al eliminar fotos: {e}", flush=True)
        return jsonify({"message": "Error al eliminar fotos", "error": str(e)}), 500

# =========================== ELIMINAR ÁLBUMES ===========================
@api_bp.route('/albums/delete', methods=['POST'])
def delete_albums():
    """
    Elimina álbumes de un usuario y desasocia las fotos contenidas en ellos.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'user_id': ID del usuario propietario de los álbumes.
    - 'album_ids': Lista de IDs de los álbumes a eliminar.

    Retorna:
        - 200 (OK): Si los álbumes se eliminaron correctamente.
        - 400 (Bad Request): Si falta algún dato obligatorio.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos enviados en la solicitud
        data = request.get_json()
        user_id = data.get('user_id')
        album_ids = data.get('album_ids')

        # Validar que se proporcionaron todos los datos requeridos
        if not user_id or not album_ids:
            return jsonify({"message": "User ID y album_ids son obligatorios"}), 400

        # Buscar y eliminar los álbumes del usuario
        for album_id in album_ids:
            album = Album.query.filter_by(id=album_id, user_id=int(user_id)).first()
            if album:
                # Desasociar las fotos contenidas en el álbum
                for photo in album.photos:
                    photo.album_id = None  # Las fotos siguen existiendo, pero sin álbum asociado
                
                # Eliminar el álbum de la base de datos
                db.session.delete(album)

        db.session.commit()  # Confirmar cambios en la base de datos

        return jsonify({"message": "Álbumes eliminados con éxito"}), 200
    except Exception as e:
        # Manejo de errores en caso de problemas con la base de datos u otra excepción
        print(f"Error al eliminar álbumes: {e}", flush=True)
        return jsonify({"message": "Error al eliminar álbumes", "error": str(e)}), 500


# =========================== COMPARTIR ÁLBUMES ===========================
@api_bp.route('/albums/share', methods=['POST'])
def share_album():
    """
    Genera un enlace único para compartir un álbum.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'album_id': ID del álbum a compartir.
    - 'user_id': ID del usuario que comparte el álbum.
    """
    try:
        data = request.json
        album_id = data.get('album_id')
        user_id = data.get('user_id')

        if not album_id or not user_id:
            return jsonify({"message": "Faltan parámetros."}), 400

        album = Album.query.filter_by(id=album_id, user_id=user_id).first()
        if not album:
            return jsonify({"message": "Álbum no encontrado."}), 404

        if not album.share_token:
            album.share_token = str(uuid.uuid4())  # Generar token único
            db.session.commit()

        return jsonify({"share_link": f"http://localhost:3000/shared/{album.share_token}"}), 200

    except Exception as e:
        print(f"Error al compartir el álbum: {e}", flush=True)
        return jsonify({"error": "Error interno"}), 500

# =========================== CAMBIAR CONTRASEÑA ===========================
@api_bp.route('/change-password', methods=['POST'])
def change_password():
    """
    Permite a un usuario cambiar su contraseña.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'user_id': ID del usuario que quiere cambiar su contraseña.
    - 'current_password': Contraseña actual del usuario.
    - 'new_password': Nueva contraseña a establecer.

    Retorna:
        - 200 (OK): Si la contraseña se cambia exitosamente.
        - 401 (Unauthorized): Si la contraseña actual es incorrecta.
        - 404 (Not Found): Si el usuario no existe.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos enviados desde el frontend
        data = request.get_json()
        user_id = data.get('user_id')
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        # Buscar el usuario en la base de datos
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        # Verificar que la contraseña actual ingresada coincida con la almacenada
        if not check_password_hash(user.password, current_password):
            return jsonify({'error': 'La contraseña actual es incorrecta'}), 401

        # Encriptar la nueva contraseña y actualizar en la base de datos
        user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()  # Guardar cambios

        return jsonify({'message': 'Contraseña actualizada correctamente'}), 200
    except Exception as e:
        # Manejo de errores en caso de problemas con la base de datos u otra excepción
        print(f"Error al cambiar contraseña: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

# =========================== ORGANIZACIÓN AUTOMÁTICA DE CONTENIDO ===========================
@api_bp.route('/albums/organize', methods=['POST'])
def organize_content():
    """
    Organiza automáticamente el contenido multimedia (fotos, videos y textos).

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'photos': Lista de IDs de fotos.
    - 'videos': Lista de IDs de videos.
    - 'texts': Texto descriptivo o notas.

    Retorna:
        - 200 (OK): Estructura organizada del contenido en formato JSON.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos enviados en la solicitud
        data = request.get_json()
        photos = data.get('photos', [])  # Lista de fotos
        videos = data.get('videos', [])  # Lista de videos
        texts = data.get('texts', "")  # Texto o notas asociadas

        # Simulación: Lógica de IA para organizar el contenido
        organized_content = {
            "sections": [
                {"title": "Fotos", "items": photos},
                {"title": "Videos", "items": videos},
                {"title": "Notas", "items": [texts]},
            ]
        }

        return jsonify({"organized_content": organized_content}), 200
    except Exception as e:
        # Manejo de errores en caso de problemas con los datos recibidos
        print(f"Error en la organización de contenido: {e}")
        return jsonify({"error": "Error interno"}), 500


# =========================== ORGANIZACIÓN MANUAL DE CONTENIDO ===========================
@api_bp.route('/organize/manual', methods=['POST'])
def organize_manual():
    """
    Organiza manualmente el contenido multimedia basado en la entrada del usuario.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'photos': Lista de IDs de fotos seleccionadas.
    - 'videos': Lista de IDs de videos seleccionados.
    - 'notes': Lista de notas o textos introducidos por el usuario.

    Retorna:
        - 200 (OK): Contenido organizado en formato JSON.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos enviados en la solicitud
        data = request.get_json()
        photos = data.get('photos', [])  # Lista de fotos
        videos = data.get('videos', [])  # Lista de videos
        notes = data.get('notes', [])  # Lista de notas

        # Organización manual del contenido en categorías
        organized_content = {
            "Fotos": photos,
            "Videos": videos,
            "Notas": notes
        }

        return jsonify({"organized_content": organized_content}), 200
    except Exception as e:
        # Manejo de errores en caso de problemas con los datos recibidos
        print(f"Error en la organización manual: {e}")
        return jsonify({"error": "Error interno"}), 500

# =========================== FUNCIÓN DE ORGANIZACIÓN CON IA (SIMULADA) ===========================
def ai_organize(photos, videos, notes):
    """
    Simulación de procesamiento basado en Inteligencia Artificial (IA).

    Esta función simplemente agrupa las fotos, videos y notas en categorías sin aplicar
    un modelo de IA real. Se puede mejorar integrando modelos de clasificación automática.

    Parámetros:
        - photos (list): Lista de identificadores o rutas de fotos.
        - videos (list): Lista de identificadores o rutas de videos.
        - notes (str): Texto o notas asociadas.

    Retorna:
        - dict: Estructura JSON con el contenido organizado.
    """
    return {
        "Fotos organizadas por IA": photos,
        "Videos organizados por IA": videos,
        "Notas analizadas por IA": notes
    }


# =========================== ORGANIZACIÓN AUTOMÁTICA CON IA ===========================
@api_bp.route('/organize/ai', methods=['POST'])
def organize_ai():
    """
    Organiza contenido multimedia utilizando Inteligencia Artificial.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'photos': Lista de IDs de fotos a organizar.
    - 'notes': Texto descriptivo o notas que puedan ayudar a la clasificación.

    La función busca las imágenes en la base de datos, valida que existan y luego
    utiliza un modelo de IA para analizarlas y organizarlas en categorías.

    Retorna:
        - 200 (OK): Contenido organizado en formato JSON.
        - 400 (Bad Request): Si no se proporcionan fotos o las rutas de imágenes no existen.
        - 404 (Not Found): Si no se encuentran imágenes con los IDs proporcionados.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos enviados en la solicitud
        data = request.get_json()
        photo_ids = data.get('photos', [])  # Lista de IDs de fotos
        notes = data.get('notes', '')  # Texto o notas asociadas

        # Validar que al menos se haya proporcionado una foto
        if not photo_ids:
            return jsonify({"error": "No se proporcionaron IDs de fotos"}), 400

        # Buscar imágenes en la base de datos
        images = Image.query.filter(Image.id.in_(photo_ids)).all()
        if not images:
            return jsonify({"error": "No se encontraron imágenes con los IDs proporcionados"}), 404

        # Obtener las rutas de las imágenes verificando que existan en el servidor
        image_paths = [image.file_path for image in images if os.path.exists(image.file_path)]
        if not image_paths:
            return jsonify({"error": "No se encontraron rutas de imágenes válidas"}), 400

        # Procesar imágenes y notas con un modelo de IA
        analysis_results = process_images_with_ai(image_paths)

        # Agrupar las imágenes en categorías usando clustering con IA
        organized_content = cluster_images(analysis_results)

        return jsonify({"organized_content": organized_content}), 200
    except Exception as e:
        # Manejo de errores en caso de problemas con la base de datos o procesamiento
        print(f"Error en organización por IA: {e}")
        return jsonify({"error": "Error interno", "details": str(e)}), 500
# =========================== SUGERENCIA DE ÁLBUMES BASADA EN IA ===========================
@api_bp.route('/albums/suggestions', methods=['POST'])
def suggest_albums_with_ai():
    """
    Genera sugerencias de álbumes agrupando imágenes mediante IA.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'photo_ids': Lista de IDs de fotos que se desean agrupar en álbumes.
    - 'user_id': ID del usuario que solicita las sugerencias.

    La función usa el modelo CLIP para extraer características de las imágenes
    y agruparlas mediante KMeans en un número de clústeres óptimo.

    Retorna:
        - 200 (OK): Lista de álbumes sugeridos con las fotos agrupadas.
        - 400 (Bad Request): Si no se proporcionan fotos o las rutas no existen.
        - 404 (Not Found): Si no se encuentran imágenes con los IDs proporcionados.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos enviados en la solicitud
        data = request.get_json()
        photo_ids = data.get('photo_ids', [])
        user_id = data.get('user_id')

        # Depuración: Imprimir los IDs de fotos y usuario
        print(f"Photo IDs recibidos: {photo_ids}")
        print(f"User ID recibido: {user_id}")

        # Validación: Verificar que se proporcionaron fotos
        if not photo_ids:
            return jsonify({"error": "No se proporcionaron fotos para sugerencias"}), 400

        # Buscar las imágenes en la base de datos
        images = Image.query.filter(Image.id.in_(photo_ids)).all()
        if not images:
            return jsonify({"error": "No se encontraron imágenes con los IDs proporcionados"}), 404

        # Obtener rutas de imágenes que existan físicamente en el servidor
        image_paths = [image.file_path for image in images if os.path.exists(image.file_path)]
        if not image_paths:
            return jsonify({"error": "No se encontraron rutas de imágenes válidas"}), 400

        # Cargar modelo CLIP para extracción de características
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

        # Extraer características de cada imagen
        features = []
        for path in image_paths:
            try:
                pil_image = PILImage.open(path).convert("RGB")  # Convertir a formato RGB
                inputs = processor(images=pil_image, return_tensors="pt")
                outputs = model.get_image_features(**inputs)  # Extraer características
                features.append(outputs.detach().numpy().flatten())  # Convertir a vector 1D
            except Exception as e:
                print(f"Error al procesar la imagen {path}: {e}", flush=True)
                continue

        # Validar que se hayan obtenido características suficientes
        if len(features) < 2:
            return jsonify({"error": "Se necesitan al menos 2 fotos para generar sugerencias"}), 400

        features = np.array(features)  # Convertir lista a array de numpy
        print(f"Shape de las características extraídas: {features.shape}")

        # Aplicar clustering con KMeans
        n_clusters = min(len(features), 3)  # Definir número de clústeres (máx. 3)
        print(f"🔍 Cantidad de características extraídas: {len(features)}")

        kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(features)
        labels = kmeans.labels_
        print(f"🔖 Clústeres generados ({len(labels)} grupos): {labels}")

        # Generar sugerencias de álbumes agrupando por clústeres
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


# =========================== SUGERENCIA AUTOMÁTICA DE ÁLBUMES ===========================
@api_bp.route('/albums/suggest-auto', methods=['POST'])
def suggest_albums_auto():
    """
    Genera álbumes automáticamente basándose en el historial de fotos del usuario.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')

        print(f"📡 Solicitud recibida para generar álbumes con IA. User ID: {user_id}")

        if not user_id:
            print("❌ Error: No se proporcionó user_id")
            return jsonify({"error": "Se requiere el ID del usuario"}), 400

        # Obtener todas las fotos y videos del usuario desde la base de datos
        media_files = Image.query.filter_by(user_id=user_id).all()
        if not media_files:
            print("⚠️ No se encontraron archivos multimedia para este usuario.")
            return jsonify({"error": "No se encontraron archivos multimedia"}), 404

        # Filtrar archivos que realmente existen en el sistema
        valid_media_files = [
            {
                "id": file.id,
                "file_name": file.file_name,
                "file_path": file.file_path,
                "type": "video" if file.file_name.lower().endswith(('.mp4', '.webm', '.ogg', '.avi', '.mov')) else "image"
            }
            for file in media_files if os.path.exists(file.file_path)
        ]

        print(f"📂 Archivos válidos en el sistema: {len(valid_media_files)}")

        if not valid_media_files:
            print("❌ No se encontraron archivos multimedia válidos en el sistema.")
            return jsonify({"error": "No se encontraron archivos multimedia válidos"}), 400

        # Extraer frames solo para análisis, pero **no guardarlos en la lista final**
        expanded_media_files = []
        video_frame_map = {}  # Mapeo de videos a sus frames usados para análisis
        for media in valid_media_files:
            file_path = media["file_path"]
            if media["type"] == "video":
                print(f"🎥 Procesando video: {file_path}")
                frame_images = extract_frames(file_path)  # Extraer frames
                print(f"📸 Frames extraídos: {len(frame_images)}")

                # Guardar los frames en archivos temporales solo para análisis
                frame_paths = []
                for idx, img in enumerate(frame_images[:5]):  # Solo tomamos 5 frames máximo
                    frame_path = f"{file_path}_frame_{idx}.jpg"  
                    img.save(frame_path)  # Guardar la imagen en disco
                    frame_paths.append(frame_path)

                video_frame_map[file_path] = frame_paths  # Guardar frames para referencia

                # **Agregamos el video a la lista en lugar de los frames**
                expanded_media_files.append(media)

            else:
                expanded_media_files.append(media)  # Agregar imágenes originales

        print(f"📂 Total archivos a procesar después de expansión (sin frames en lista final): {len(expanded_media_files)}")

        # Extraer características con IA usando frames de video y fotos originales
        image_paths = []
        for media in expanded_media_files:
            if media["type"] == "video":
                image_paths.append(video_frame_map[media["file_path"]][0])  # Usar solo el primer frame
            else:
                image_paths.append(media["file_path"])

        features = process_images_with_ai(image_paths)
        print(f"📊 Total características extraídas: {len(features)}")

        if len(features) < 2:
            print(f"⚠️ No hay suficientes imágenes/videos para agrupar (min. 2, encontrados: {len(features)})")
            return jsonify({"error": "Se necesitan al menos 2 fotos/videos para generar sugerencias"}), 400

        # Agrupar con KMeans
        print("📊 Realizando agrupación con KMeans...")
        n_clusters = optimal_kmeans(features)
        labels = cluster_images(features, n_clusters)

        if len(labels) != len(expanded_media_files):
            print(f"❌ Error: Clustering generó {len(labels)} etiquetas, pero hay {len(expanded_media_files)} archivos.")
            return jsonify({"error": "Error en la agrupación de imágenes"}), 500

        print(f"🔖 Clústeres generados correctamente: {labels}")

        # Construcción de álbumes agrupados
        album_dict = {i: [] for i in set(labels)}
        for idx, cluster_id in enumerate(labels):
            album_dict[cluster_id].append(expanded_media_files[idx])

        suggestions = []
        for cluster_id, media in album_dict.items():
            if media:
                album_info = {
                    "album_name": f"Álbum {cluster_id + 1}",
                    "photo_ids": [m["id"] for m in media],
                    "photos": [{"id": m["id"], "file_name": m["file_name"], "type": m["type"]} for m in media]
                }
                suggestions.append(album_info)
                print(f"📌 Álbum {cluster_id + 1} generado con {len(media)} archivos.")

        return jsonify({"suggestions": suggestions}), 200

    except Exception as e:
        print(f"❌ Error generando sugerencias automáticas: {e}")
        return jsonify({"error": "Error interno", "details": str(e)}), 500


# =========================== FUNCIÓN PARA ENVIAR CORREO ===========================
def send_email(to_email, subject, body):
    """
    Envía un correo electrónico utilizando SMTP.

    Parámetros:
        - to_email (str): Dirección de correo del destinatario.
        - subject (str): Asunto del correo.
        - body (str): Cuerpo del mensaje.

    Retorna:
        - True si el correo se envió con éxito.
        - False si ocurrió un error durante el envío.
    """
    try:
        sender_email = "recuerdosprototipo@gmail.com"  # Correo del remitente (reemplazar con uno real)
        sender_password = "rnweattpnnzjibbc"  # Contraseña de la cuenta (⚠️ No almacenar credenciales en el código)
        smtp_server = "smtp.gmail.com"  # Servidor SMTP de Gmail
        smtp_port = 587  # Puerto para TLS

        # Configurar el mensaje de correo
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))  # Agregar el cuerpo del mensaje en texto plano

        # Conectar al servidor de correo y enviar el mensaje
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Habilitar encriptación TLS
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, message.as_string())
        server.quit()

        print("Correo enviado exitosamente")
        return True
    except Exception as e:
        print(f"Error al enviar el correo: {e}")
        return False


# =========================== RECUPERACIÓN DE CONTRASEÑA ===========================
@api_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Genera un enlace de restablecimiento de contraseña y lo envía al correo del usuario.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'email': Dirección de correo del usuario.

    La función verifica si el usuario existe en la base de datos, genera un token de recuperación
    válido por 1 hora, y envía un correo con un enlace de restablecimiento.

    Retorna:
        - 200 (OK): Si el correo se envió con éxito.
        - 400 (Bad Request): Si el correo electrónico no fue proporcionado.
        - 404 (Not Found): Si el usuario no existe en la base de datos.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener el correo electrónico desde el cuerpo de la solicitud
        data = request.get_json()
        email = data.get('email')

        # Validar que el correo haya sido proporcionado
        if not email:
            return jsonify({"message": "El correo electrónico es obligatorio"}), 400

        # Buscar al usuario en la base de datos
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "El usuario no existe"}), 404

        # Generar un token único y definir su tiempo de expiración (1 hora)
        reset_token = str(uuid.uuid4())
        expiration_time = datetime.utcnow() + timedelta(hours=1)

        # Guardar el token y su expiración en la base de datos del usuario
        user.reset_token = reset_token
        user.reset_token_expiration = expiration_time
        db.session.commit()

        # Crear enlace de restablecimiento de contraseña
        reset_link = f"http://localhost:3000/reset-password/{reset_token}"

        # Configurar el mensaje del correo
        subject = "Recuperación de contraseña"
        body = f"""Hola {user.name},\n\n
        Haz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_link}\n\n
        Este enlace es válido por 1 hora. Si no solicitaste esto, ignora este correo."""

        # Enviar el correo al usuario
        email_sent = send_email(email, subject, body)
        if not email_sent:
            return jsonify({"message": "Error al enviar el correo"}), 500

        return jsonify({"message": "Instrucciones para restablecer la contraseña enviadas al correo proporcionado"}), 200
    except Exception as e:
        print(f"Error en la recuperación de contraseña: {e}")
        return jsonify({"message": "Error interno del servidor"}), 500

   # =========================== RESTABLECER CONTRASEÑA ===========================
@api_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Restablece la contraseña del usuario usando un token de recuperación.

    Recibe una solicitud POST con los siguientes datos en formato JSON:
    - 'token': Token de restablecimiento de contraseña enviado al usuario.
    - 'new_password': Nueva contraseña que el usuario quiere establecer.

    La función busca al usuario por el token, verifica que no haya expirado,
    y actualiza la contraseña si es válido.

    Retorna:
        - 200 (OK): Si la contraseña se restableció correctamente.
        - 400 (Bad Request): Si falta algún dato o el token ha expirado.
        - 404 (Not Found): Si el token no es válido o el usuario no existe.
        - 500 (Internal Server Error): Si ocurre un error inesperado.
    """
    try:
        # Obtener los datos enviados en la solicitud
        data = request.get_json()
        reset_token = data.get('token')  # Token único de recuperación
        new_password = data.get('new_password')  # Nueva contraseña

        # Validar que se proporcionaron el token y la nueva contraseña
        if not reset_token or not new_password:
            return jsonify({'error': 'El token y la nueva contraseña son obligatorios'}), 400

        # Buscar al usuario en la base de datos usando el token
        user = User.query.filter_by(reset_token=reset_token).first()
        if not user:
            return jsonify({'error': 'Token inválido o usuario no encontrado'}), 404

        # Verificar que el token no haya expirado
        if user.reset_token_expiration < datetime.utcnow():
            return jsonify({'error': 'El token ha expirado'}), 400

        # Actualizar la contraseña en la base de datos
        user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')

        # Eliminar el token después de ser utilizado para seguridad
        user.reset_token = None
        user.reset_token_expiration = None
        db.session.commit()  # Guardar los cambios en la base de datos

        return jsonify({'message': 'Contraseña restablecida correctamente'}), 200
    except Exception as e:
        print(f"Error en reset_password: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500
# =========================== PROCESAMIENTO DE AUDIO Y TRANSCRIPCIÓN ===========================
@api_bp.route('/process-voice', methods=['POST'])
def process_voice():
    try:
        print("Solicitud recibida en /process-voice")

        if 'audio' not in request.files or 'user_id' not in request.form:
            return jsonify({"error": "Faltan datos (audio o user_id)."}), 400

        audio_file = request.files['audio']
        user_id = request.form['user_id']

        if not os.path.exists(TEMP_AUDIO_DIR):
            os.makedirs(TEMP_AUDIO_DIR)

        wav_path = os.path.join(TEMP_AUDIO_DIR, f"{user_id}_audio.wav")
        audio_file.save(wav_path)

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            try:
                transcription = recognizer.recognize_google(audio_data, language="es-ES")
                print(f"🗣 Transcripción: {transcription}")
            except Exception as e:
                print(f"Error en la transcripción: {e}")
                transcription = ""

        # Si hay transcripción, buscar coincidencias en las imágenes
        photos = []
        if transcription:
            user_photos = Image.query.filter_by(user_id=user_id).all()
            for photo in user_photos:
                path = photo.file_path
                if path.lower().endswith(('.mp4', '.avi', '.mov')):
                    frames = extract_frames(path, num_frames=5)
                    for idx, frame in enumerate(frames):
                        frame_path = f"{path}_frame_{idx}.jpg"
                        frame.save(frame_path)
                        similarity = calculate_similarity_with_text(clip_model, clip_processor, transcription, frame_path)
                        if similarity > 0.25:
                            photos.append({
                                "url": f"/uploads/{photo.file_name}",
                                "name": photo.file_name,
                                "score": similarity,
                                "type": "video"
                            })
                            break
                else:
                    similarity = calculate_similarity_with_text(clip_model, clip_processor, transcription, path)
                    if similarity > 0.25:
                        photos.append({
                            "url": f"/uploads/{photo.file_name}",
                            "name": photo.file_name,
                            "score": similarity,
                            "type": "image"
                        })

        return jsonify({"transcription": transcription, "photos": photos}), 200

    except Exception as e:
        print(f"Error procesando el audio: {e}")
        return jsonify({"error": "Error interno", "details": str(e)}), 500

# =========================== OBTENER TODAS LAS CRONOLOGÍAS DEL USUARIO ===========================
@api_bp.route('/timelines', methods=['GET'])
def get_timelines():
    """
    La función busca todas las cronologías creadas por el usuario y devuelve 
    los eventos relacionados con sus respectivas imágenes.
    """
    try:
        # Obtener el user_id desde los parámetros de la URL
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID es obligatorio"}), 400

        # Consultar todas las cronologías del usuario en la base de datos
        timelines = Timeline.query.filter_by(user_id=user_id).all()
        timeline_list = []

        # Recorrer cada cronología y obtener sus eventos
        for timeline in timelines:
            events_list = []
            for event in timeline.events:
                # Recuperar las fotos asociadas al evento
                photo_list = [
                    {
                        "id": photo.id,
                        "file_name": photo.file_name,
                        "file_path": f"/uploads/{photo.file_name}"
                    }
                    for photo in event.images  # Se recuperan múltiples imágenes
                ]

                # Agregar evento a la lista de eventos de la cronología
                events_list.append({
                    "id": event.id,
                    "description": event.description,
                    "date": event.date.strftime('%Y-%m-%d') if event.date else None,
                    "photos": photo_list  # Se incluyen las fotos del evento
                })

            # Agregar cronología a la lista con sus eventos ordenados por fecha
            timeline_list.append({
                "id": timeline.id,
                "name": timeline.name,
                "created_at": timeline.created_at.strftime('%Y-%m-%d') if timeline.created_at else None,
                "events": sorted(events_list, key=lambda x: x["date"] if x["date"] else "")
            })

        return jsonify({"timelines": timeline_list}), 200
    except Exception as e:
        print(f"Error obteniendo cronologías: {e}")
        return jsonify({"error": "Error interno"}), 500
# =========================== SERVIR ARCHIVOS SUBIDOS ===========================
@api_bp.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    """
    Sirve archivos subidos desde el directorio 'uploads'.

    Recibe una solicitud GET con:
    - 'filename': Nombre del archivo a recuperar.

    La función busca el archivo en el directorio 'uploads' y lo devuelve como respuesta.

    Retorna:
        - 200 (OK): El archivo solicitado.
        - 500 (Internal Server Error): Si ocurre un error al recuperar el archivo.
    """
    try:
        file_path = os.path.join(PHOTO_DIR, filename)

        # Determinar el tipo MIME
        if filename.endswith(('.mp4', '.webm', '.ogg', '.avi', '.mov')):
            mimetype = 'video/mp4' if filename.endswith('.mp4') else 'video/webm'
        elif filename.endswith(('.jpg', '.jpeg', '.png', '.gif')):
            mimetype = 'image/jpeg' if filename.endswith('.jpg') else 'image/png'
        else:
            mimetype = 'application/octet-stream'  # Tipo genérico

        return send_from_directory(PHOTO_DIR, filename, mimetype=mimetype)
    except Exception as e:
        print(f"Error al servir el archivo: {e}", flush=True)
        return jsonify({"message": "Error al servir el archivo"}), 500


@api_bp.route('/process-text', methods=['POST'])
#@jwt_required()  # 🔒 Requiere autenticación
def process_text():
    try:
        data = request.get_json()
        input_text = data.get("text", "").lower()
        user_id = data.get("user_id")  # 🔥 Obtener user_id correctamente

        if not user_id:
            return jsonify({"message": "El user_id es obligatorio."}), 400

        print(f"🔍 Solicitud recibida - Usuario: {user_id}, Texto: {input_text}")  # 🛠 Debugging

        if not input_text:
            return jsonify({"message": "El texto está vacío."}), 400

        # Obtener imágenes SOLO del usuario autenticado
        user_photos = Image.query.filter_by(user_id=user_id).all()

        print(f"📸 Imágenes encontradas para el usuario: {len(user_photos)}")  # 🛠 Debugging

        photos = []
        for photo in user_photos:
            photo_path = photo.file_path
            if photo_path.lower().endswith(('.mp4', '.avi', '.mov')):  # Si es un video
                print(f"🎥 Procesando video: {photo.file_name}")
                frames = extract_frames(photo_path, num_frames=5)  # Extrae 5 frames

                for idx, frame in enumerate(frames):
                    frame_path = f"{photo_path}_frame_{idx}.jpg"  # Guardar los frames temporalmente
                    frame.save(frame_path)

                    similarity = calculate_similarity_with_text(clip_model, clip_processor, input_text, frame_path)
                    if similarity > 0.25:
                        photos.append({
                            "url": f"/uploads/{photo.file_name}",  # Enviar el video en la respuesta
                            "name": photo.file_name,
                            "score": similarity,
                            "type": "video"  # Indicar que es un video
                        })
                        break  # Si al menos un frame es relevante, añadimos el video y pasamos al siguiente
            else:  # Procesar como imagen
                similarity = calculate_similarity_with_text(clip_model, clip_processor, input_text, photo_path)
                if similarity > 0.25:
                    photos.append({
                        "url": f"/uploads/{photo.file_name}",
                        "name": photo.file_name,
                        "score": similarity,
                        "type": "image"
                    })

        if photos:
            print(f"✅ Enviando {len(photos)} imágenes en respuesta")  # 🛠 Debugging
            return jsonify({"photos": photos}), 200
        else:
            print("⚠️ No se encontraron fotos relacionadas")  # 🛠 Debugging
            return jsonify({"message": "No se encontraron fotos relacionadas."}), 200

    except Exception as e:
        print(f"❌ Error en /process-text: {e}")
        return jsonify({"error": "Error interno", "details": str(e)}), 500


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
                description=event.get('description'),
                date=datetime.strptime(event.get('date'), '%Y-%m-%d')
            )
            db.session.add(new_event)
            db.session.commit()

            # Asociar imágenes al evento
            photo_ids = event.get('photo_ids', [])  
            for photo_id in photo_ids:
                photo = Image.query.get(photo_id)
                if photo:
                    new_event.images.append(photo)  # Se establece la relación correctamente

            db.session.commit()  

        return jsonify({"message": "Cronología creada exitosamente", "timeline_id": timeline.id}), 201

    except Exception as e:
        print(f"Error creando la cronología: {e}")
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

@api_bp.route('/shared/<share_token>', methods=['GET'])
def get_shared_album(share_token):
    try:
        album = Album.query.filter_by(share_token=share_token).first()
        if not album:
            return jsonify({"error": "Álbum no encontrado"}), 404

        album_data = {
            "id": album.id,
            "name": album.name,
            "photos": [
                {"id": photo.id, "file_name": photo.file_name}
                for photo in album.photos
            ]
        }

        return jsonify(album_data), 200
    except Exception as e:
        print(f"Error al obtener álbum compartido: {e}")
        return jsonify({"error": "Error interno"}), 500
