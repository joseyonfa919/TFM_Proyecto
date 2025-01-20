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
        # Cargar la imagen como objeto PIL
        image = Image.open(image_path).convert("RGB")

        # Crear inputs usando el processor
        inputs = processor(
            texts=[input_text],  # Textos deben ser una lista
            images=image,  # Imagen PIL
            return_tensors="pt",  # Devolver tensores
            padding=True
        )

        # Calcular las características y la similitud
        with torch.no_grad():
            text_features = model.get_text_features(**inputs)
            image_features = model.get_image_features(**inputs)
            similarity = torch.nn.functional.cosine_similarity(text_features, image_features)

        return similarity.item()
    except Exception as e:
        print(f"Error calculando similitud: {e}")
        raise