import os


class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://user_generico:UserGenerico@localhost:5432/DB_PRUEBAS?client_encoding=utf8'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "secret_key"
    CORS_HEADERS = "Content-Type"