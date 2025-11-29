FROM python:3.13-slim

WORKDIR /app

# Instalar Node.js
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Copiar archivos
COPY requirements.txt .
COPY package.json package-lock.json ./
COPY . .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt
RUN npm ci

# Compilar Next.js
RUN npm run build

# Exponer puertos
EXPOSE 3000 8000

# Comando de inicio
CMD ["sh", "-c", "python run_server.py & npm start"]
