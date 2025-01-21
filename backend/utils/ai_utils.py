import torch
from transformers import CLIPProcessor, CLIPModel
from sklearn.cluster import KMeans
import numpy as np
import os
from PIL import Image



# Cargar el modelo CLIP
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def process_images_with_ai(image_paths, notes):
    try:
        features = []
        for path in image_paths:
            if not os.path.exists(path):
                raise FileNotFoundError(f"La imagen {path} no existe.")

            # Procesar la imagen con CLIP
            inputs = processor(images=[path], return_tensors="pt")
            outputs = model.get_image_features(**inputs)
            features.append(outputs.detach().numpy())
        return features
    except Exception as e:
        print(f"Error procesando imágenes: {e}")
        raise

def cluster_images(features, num_clusters=3):
    try:
        if not features:
            raise ValueError("No hay características para agrupar.")

        kmeans = KMeans(n_clusters=num_clusters, random_state=0)
        clusters = kmeans.fit_predict(np.array(features))
        return clusters.tolist()
    except Exception as e:
        print(f"Error en agrupación: {e}")
        raise

def calculate_similarity_with_text(model, processor, input_text, image_path):
    """
    Procesa una imagen y calcula su similitud con un texto usando CLIP.
    """
    try:
        print("Iniciando cálculo de similitud...")
        print(f"Texto de entrada: {input_text}")
        print(f"Ruta de la imagen: {image_path}")

        # Cargar y procesar la imagen
        image = Image.open(image_path).convert("RGB")
        print(f"Imagen cargada y convertida a RGB: {image_path}")
        image_inputs = processor(images=image, return_tensors="pt")
        print(f"Inputs de imagen procesados: {image_inputs}")

        # Procesar el texto
        text_inputs = processor(text=[input_text], return_tensors="pt")
        print(f"Inputs de texto procesados: {text_inputs}")

        # Obtener características de texto e imagen
        with torch.no_grad():
            text_features = model.get_text_features(
                input_ids=text_inputs["input_ids"], attention_mask=text_inputs["attention_mask"]
            )
            print(f"Características de texto obtenidas: {text_features}")

            image_features = model.get_image_features(pixel_values=image_inputs["pixel_values"])
            print(f"Características de imagen obtenidas: {image_features}")

            # Calcular la similitud coseno
            similarity = torch.nn.functional.cosine_similarity(text_features, image_features)
            print(f"Similitud coseno calculada: {similarity}")

        return similarity.item()

    except Exception as e:
        print(f"Error calculando similitud: {e}")
        raise
