import os


class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://user_generico:UserGenerico@localhost:5432/DB_PRUEBAS_1?client_encoding=utf8' #Jose
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "secret_key"
    CORS_HEADERS = "Content-Type"
    JWT_ACCESS_TOKEN_EXPIRES = False  # Deshabilita la expiración del token