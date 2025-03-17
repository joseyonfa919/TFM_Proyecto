import speech_recognition as sr  # Librería para reconocimiento de voz
import whisper  # Modelo avanzado para reconocimiento de voz
from transformers import pipeline  # Modelos de procesamiento de texto con transformers
import os  # Manejo de archivos y directorios

# Clase para manejar el reconocimiento de voz
# =========================== CLASE PARA RECONOCIMIENTO DE VOZ ===========================

#class VoiceHandler:
#    """
#    Maneja el reconocimiento de voz utilizando Google Speech Recognition.
#    """
#
#    def __init__(self):
#        """Inicializa el reconocedor de voz."""
#        self.recognizer = sr.Recognizer()
#
#    def recognize_voice(self, audio_source):
#        """
#        Transcribe un archivo de audio a texto.
#
#        Parámetros:
#            - audio_source (str): Ruta del archivo de audio en formato WAV.
#
#        Retorna:
#            - str: Texto transcrito o mensaje de error si la transcripción falla.
#        """
#        try:
#            with sr.AudioFile(audio_source) as source:
#                audio_data = self.recognizer.record(source)  # Grabar el audio completo
#            return self.recognizer.recognize_google(audio_data, language="es-ES")  # Transcribir a texto en español
#        except sr.UnknownValueError:
#            return "No se pudo entender el audio."
#        except sr.RequestError as e:
#            return f"Error en el servicio de reconocimiento de voz: {e}"
#
# =========================== CLASE PARA RECONOCIMIENTO DE VOZ ===========================

class VoiceHandler:
    """
    Maneja el reconocimiento de voz utilizando Whisper de OpenAI.
    """
    def __init__(self, model_size="medium"):
        """Inicializa el modelo Whisper."""
        self.model = whisper.load_model(model_size)

    def recognize_voice(self, audio_source):
        """
        Transcribe un archivo de audio a texto con Whisper.

        Parámetros:
            - audio_source (str): Ruta del archivo de audio en formato WAV.

        Retorna:
            - str: Texto transcrito o mensaje de error si la transcripción falla.
        """
        try:
            result = self.model.transcribe(audio_source, language="es")
            return result["text"]
        except Exception as e:
            return f"Error en la transcripción: {e}"
# =========================== CLASE PARA PROCESAMIENTO DE TEXTO ===========================

class TextHandler:
    """
    Maneja la generación y análisis de texto utilizando un modelo de clasificación.
    """

    def __init__(self):
        """Inicializa el modelo de clasificación de texto (ajustable según el modelo deseado)."""
        self.text_pipeline = pipeline("text-classification", model="bert-base-uncased")  # Modelo preentrenado

    def process_text(self, input_text):
        """
        Procesa y analiza un texto utilizando un modelo de clasificación.

        Parámetros:
            - input_text (str): Texto a analizar.

        Retorna:
            - dict: Resultado de la clasificación de texto o mensaje de error.
        """
        try:
            result = self.text_pipeline(input_text)  # Procesar el texto con el modelo
            return result
        except Exception as e:
            return f"Error procesando texto: {e}"

        

# =========================== OBTENER LISTA DE FOTOS EN UN DIRECTORIO ===========================

def get_photos_from_directory(directory):
    """
    Devuelve una lista de rutas de archivos en un directorio dado.

    Parámetros:
        - directory (str): Ruta del directorio donde se buscarán imágenes.

    Retorna:
        - list: Lista de rutas de archivos de imágenes en el directorio.
    """
    return [os.path.join(directory, f) for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f))]
