import torch  # Librería para cálculos en GPU y modelos de IA
from transformers import CLIPProcessor, CLIPModel  # Modelo CLIP para análisis de imágenes y texto
from sklearn.cluster import KMeans,DBSCAN  # Algoritmo de clustering para agrupar imágenes
import numpy as np  # Manipulación de matrices y cálculos numéricos
import os  # Manejo de archivos y rutas
from PIL import Image  # Procesamiento de imágenes
import spacy  # Procesamiento de lenguaje natural (NLP)
from sentence_transformers import SentenceTransformer  # Mejor modelo para similitud texto-imagen
from nltk.corpus import wordnet  # Para mejorar el procesamiento de texto
from sklearn.preprocessing import StandardScaler
from transformers import pipeline
import cv2  # OpenCV para extraer frames de videos

# =========================== CARGA DE MODELOS ===========================

# Cargar el modelo CLIP para análisis de imágenes y texto
#odel = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
#processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")



def get_clip_model():
    return CLIPModel.from_pretrained("openai/clip-vit-large-patch14")

def get_clip_processor():
    return CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")

clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")

text_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
description_generator = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")

# Cargar el modelo NLP de spaCy para procesamiento de texto
nlp = spacy.load("en_core_web_sm")

# =========================== PROCESAMIENTO DE IMÁGENES ===========================

#def process_images_with_ai(image_paths, notes):
#    """
#    Extrae características de imágenes utilizando CLIP.
#
#    Parámetros:
#        - image_paths (list): Lista de rutas de imágenes a procesar.
#        - notes (str): Texto opcional para agregar contexto (actualmente no utilizado).
#
#    Retorna:
#        - features (list): Lista de vectores con características extraídas de las imágenes.
#    """
#    try:
#        #nuevo
#        model = get_clip_model()
#        processor = get_clip_processor()
#        features = []
#        for path in image_paths:
#            if not os.path.exists(path):
#                raise FileNotFoundError(f"La imagen {path} no existe.")
#
#
#            image = Image.open(path).convert("RGB")
#
#            # Procesar la imagen con CLIP
#            #inputs = processor(images=[path], return_tensors="pt")
#            inputs = processor(images=image, return_tensors="pt")
#            #outputs = model.get_image_features(**inputs)
#            outputs = model.get_image_features(**inputs)
#            normalized_features = outputs / outputs.norm(dim=-1, keepdim=True)
#            #features.append(outputs.detach().numpy())  # Convertir salida de tensor a array
#            features.append(normalized_features.detach().numpy())
#        return features
#    except Exception as e:
#        print(f"Error procesando imágenes: {e}")
#        raise

def process_images_with_ai(image_paths):
    """
    Procesa imágenes y videos para extraer características con CLIP.
    - Si el archivo es una imagen, lo procesa directamente.
    - Si es un video, extrae varios frames y los procesa.
    """
    features = []
    seen_files = set()
    print(f"📊 Total recibidos en process_images_with_ai: {len(image_paths)}")
    print("🔄 Iniciando procesamiento de archivos con IA...")

    for path in image_paths:
        if path in seen_files:
            print(f"⚠️ Archivo duplicado detectado y omitido: {path}")
            continue  # Evita procesar archivos duplicados

        seen_files.add(path)

        try:
            if not os.path.exists(path):
                print(f"⚠️ Archivo no encontrado: {path}")
                continue

            print(f"🖼️ Procesando imagen: {path}")
            img = Image.open(path).convert("RGB")  # Todas las rutas son imágenes

            # Convertir la imagen a tensor
            inputs = clip_processor(images=img, return_tensors="pt")

            # Extraer características con CLIP
            with torch.no_grad():
                feature = clip_model.get_image_features(**inputs).numpy().flatten()
                features.append(feature)

        except Exception as e:
            print(f"❌ Error procesando archivo {path}: {e}")

    print(f"✅ Características extraídas de {len(features)} archivos.")
    return features



def extract_frames(video_path, num_frames=5):
    """
    Extrae frames de un video y los guarda como imágenes en memoria.
    """
    print(f"🎥 Procesando video: {video_path}")
    try:
        cap = cv2.VideoCapture(video_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        print(f"📊 Total de frames en el video: {frame_count}")

        if frame_count == 0:
            print("⚠️ No se encontraron frames en el video.")
            return []

        interval = max(1, frame_count // num_frames)
        frame_list = []

        for i in range(num_frames):
            frame_index = i * interval
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
            ret, frame = cap.read()

            if not ret:
                print(f"❌ No se pudo extraer el frame {frame_index}.")
                continue

            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(frame)
            frame_list.append(image)
            print(f"✅ Frame {i} extraído y convertido a imagen.")

        if len(frame_list) < num_frames:
            print(f"⚠️ Solo se extrajeron {len(frame_list)} frames en lugar de {num_frames}")


        cap.release()
        return frame_list
    except Exception as e:
        print(f"❌ Error extrayendo frames del video: {e}")
        return []


# =========================== MEJOR CLUSTERING ===========================

def optimal_kmeans(features):
    """
    Determina el número óptimo de clusters usando el método del codo con inercia.
    """
    if len(features) < 2:
        print("⚠️ No hay suficientes imágenes para agrupar.")
        return 1  # No se puede hacer clustering con menos de 2 puntos

    inertia = []
    K_range = range(2, min(10, len(features)))
    for k in K_range:
        kmeans = KMeans(n_clusters=k, random_state=0).fit(features)
        inertia.append(kmeans.inertia_)
    return K_range[np.argmin(inertia)]



def cluster_images(features, n_clusters=None):
    """
    Agrupa imágenes en álbumes usando KMeans con un número óptimo de clústeres.
    """
    print("📊 Iniciando agrupamiento con KMeans...")
    
    if len(features) < 2:
        print("⚠️ No hay suficientes imágenes para agrupar.")
        return [-1] * len(features)

    try:
        optimal_k = optimal_kmeans(features)
        print(f"🔢 Número óptimo de clusters seleccionado: {optimal_k}")
        kmeans = KMeans(n_clusters=optimal_k, random_state=0)
        labels = kmeans.fit_predict(features)

        if len(labels) != len(features):
            print(f"❌ Inconsistencia detectada en clustering: {len(labels)} etiquetas vs {len(features)} características")

        print("🔖 Clústeres generados (únicos):", set(labels))  # Mostrar solo valores únicos

        if len(labels) != len(features):
            print(f"❌ Error: Clustering generó {len(labels)} etiquetas, pero solo {len(features)} archivos fueron procesados.")
            return [-1] * len(features)  # Devuelve una lista de -1 para evitar errores en el backend


        return labels
    except Exception as e:
        print(f"❌ Error en clustering: {e}")
        return [-1] * len(features)

    #try:
    #    if not features:
    #        raise ValueError("No hay características para agrupar.")
    #    optimal_k = optimal_kmeans(np.array(features))
    #    kmeans = KMeans(n_clusters=optimal_k, random_state=0).fit(features)
    #    return kmeans.labels_.tolist()
    #except Exception as e:
    #    print(f"Error en agrupación: {e}")
    #    raise


# =========================== MEJOR PROCESAMIENTO DE TEXTO ===========================

def get_synonyms(word):
    synonyms = []
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.append(lemma.name())
    return list(set(synonyms))[:3]

def preprocess_text(input_text):
    doc = nlp(input_text)
    expanded_terms = []
    for token in doc:
        if not token.is_stop and not token.is_punct:
            expanded_terms.append(token.text)
            expanded_terms.extend(get_synonyms(token.text))
    return " ".join(expanded_terms)


def generate_image_descriptions(image_paths):
    descriptions = []
    for path in image_paths:
        image = Image.open(path).convert("RGB")
        result = description_generator(image)
        descriptions.append(result[0]['generated_text'])
    return descriptions
# =========================== MEJOR SIMILITUD TEXTO-IMAGEN ===========================

def calculate_similarity_with_text(input_text, image_path):
    try:
        model = get_clip_model()
        processor = get_clip_processor()
        image = Image.open(image_path).convert("RGB")
        image_inputs = processor(images=image, return_tensors="pt")
        text_embedding = text_model.encode(input_text, normalize_embeddings=True)
        with torch.no_grad():
            image_features = model.get_image_features(**image_inputs)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            similarity = np.dot(text_embedding, image_features.T)
        return similarity.item()
    except Exception as e:
        print(f"Error calculating similarity: {e}")
        raise

# =========================== AGRUPACIÓN DE IMÁGENES CON KMEANS ===========================

#def cluster_images(features, num_clusters=3):
#    """
#    Agrupa imágenes en clústeres usando KMeans.
#
#    Parámetros:
#        - features (list): Lista de características de imágenes extraídas con CLIP.
#        - num_clusters (int): Número de clústeres a generar (por defecto 3).
#
#    Retorna:
#        - clusters (list): Lista de etiquetas asignadas a cada imagen.
#    """
#    try:
#        if not features:
#            raise ValueError("No hay características para agrupar.")
#
#        kmeans = KMeans(n_clusters=num_clusters, random_state=0)
#        clusters = kmeans.fit_predict(np.array(features))  # Ejecutar KMeans
#        return clusters.tolist()  # Convertir resultado a lista
#    except Exception as e:
#        print(f"Error en agrupación: {e}")
#        raise

# =========================== PROCESAMIENTO DE TEXTO ===========================

def preprocess_text(input_text):
    """
    Limpia y expande una consulta de texto usando spaCy.

    Parámetros:
        - input_text (str): Texto de entrada a procesar.

    Retorna:
        - expanded_text (str): Texto expandido con términos relacionados.
    """
    doc = nlp(input_text)
    expanded_terms = []
    for token in doc:
        if not token.is_stop and not token.is_punct:
            expanded_terms.append(token.text)
            # Expandir términos con palabras relacionadas (similaridad vectorial)
            for syn in token.vocab.vectors.most_similar(token.vector.reshape(1, -1), n=2):
                expanded_terms.append(syn[0])
    return " ".join(expanded_terms)
# =========================== CÁLCULO DE SIMILITUD TEXTO-IMAGEN ===========================

def calculate_similarity_with_text(model, processor, input_text, image_path):
    """
    Calcula la similitud entre un texto y una imagen usando CLIP.

    Parámetros:
        - model (CLIPModel): Modelo CLIP cargado.
        - processor (CLIPProcessor): Procesador CLIP.
        - input_text (str): Texto a comparar con la imagen.
        - image_path (str): Ruta de la imagen.

    Retorna:
        - similarity (float): Valor de similitud entre la imagen y el texto.
    """
    try:
        print(f"Processing image: {image_path} with text: {input_text}")

        # Preprocesar imagen
        image = Image.open(image_path).convert("RGB")
        image_inputs = processor(images=image, return_tensors="pt")

        # Preprocesar texto
        text_inputs = processor(text=[input_text], return_tensors="pt")

        # Obtener características de texto e imagen
        with torch.no_grad():
            text_features = model.get_text_features(**text_inputs)
            image_features = model.get_image_features(**image_inputs)

            # Normalizar características
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)

            # Calcular similitud coseno entre texto e imagen
            similarity = torch.matmul(text_features, image_features.T).squeeze()
            print(f"Cosine similarity calculated: {similarity}")

        return similarity.item()

    except Exception as e:
        print(f"Error calculating similarity: {e}")
        raise
