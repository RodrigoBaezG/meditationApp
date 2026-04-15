FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (capa cacheada)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar código fuente
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
