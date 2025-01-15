import speech_recognition as sr
from transformers import pipeline

# Clase para manejar el reconocimiento de voz
class VoiceHandler:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def recognize_voice(self, audio_source):
        with sr.AudioFile(audio_source) as source:
            audio_data = self.recognizer.record(source)
        try:
            return self.recognizer.recognize_google(audio_data, language="es-ES")  # Ajustar idioma si necesario
        except sr.UnknownValueError:
            return "No se pudo entender el audio."
        except sr.RequestError as e:
            return f"Error en el servicio de reconocimiento de voz: {e}"

# Clase para manejar generación y análisis de texto
class TextHandler:
    def __init__(self):
        self.text_pipeline = pipeline("text-classification", model="bert-base-uncased")  # Modelo ajustable

    def process_text(self, input_text):
        try:
            result = self.text_pipeline(input_text)
            return result
        except Exception as e:
            return f"Error procesando texto: {e}"
