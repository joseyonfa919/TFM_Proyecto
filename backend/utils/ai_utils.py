import torch
from transformers import CLIPProcessor, CLIPModel
from sklearn.cluster import KMeans
import numpy as np
import os
from PIL import Image
import spacy



# Cargar el modelo CLIP
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
nlp = spacy.load("en_core_web_sm")


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

def preprocess_text(input_text):
    """
    Limpia y expande la consulta textual usando spaCy.
    """
    doc = nlp(input_text)
    expanded_terms = []
    for token in doc:
        if not token.is_stop and not token.is_punct:
            expanded_terms.append(token.text)
            for syn in token.vocab.vectors.most_similar(token.vector.reshape(1, -1), n=2):
                expanded_terms.append(syn[0])
    return " ".join(expanded_terms)

def calculate_similarity_with_text(model, processor, input_text, image_path):
    """
    Calculate similarity between text and image using CLIP.
    """
    try:
        print(f"Processing image: {image_path} with text: {input_text}")

        # Preprocess image
        image = Image.open(image_path).convert("RGB")
        image_inputs = processor(images=image, return_tensors="pt")

        # Preprocess text
        text_inputs = processor(text=[input_text], return_tensors="pt")

        # Obtain text and image features
        with torch.no_grad():
            text_features = model.get_text_features(**text_inputs)
            image_features = model.get_image_features(**image_inputs)

            # Normalize features
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)

            # Calculate cosine similarity
            similarity = torch.matmul(text_features, image_features.T).squeeze()
            print(f"Cosine similarity calculated: {similarity}")

        return similarity.item()

    except Exception as e:
        print(f"Error calculating similarity: {e}")
        raise
