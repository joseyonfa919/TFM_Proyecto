# Usa una imagen base de Node.js
FROM node:16

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias de Node
RUN npm install

# Copia todos los archivos del proyecto
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Expone el puerto en el que se servirá la app (generalmente 3000 en React)
EXPOSE 3000

# Inicia el servidor de desarrollo o producción
CMD ["npm", "start"]