FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Copiar todo el código necesario para el build
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY src ./src
COPY public ./public

# Instalar dependencias y compilar
RUN npm install
ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# Stage final - Python + Node runtime
FROM python:3.11-slim

WORKDIR /app

# Instalar Node.js, Nginx y herramientas necesarias
RUN apt-get update && apt-get install -y nodejs npm curl supervisor nginx && rm -rf /var/lib/apt/lists/*

# Copiar Next.js build desde builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY package.json package-lock.json ./

# Copiar archivos de la app
COPY requirements.txt .
COPY src ./src
COPY backend ./backend
COPY run_server.py .

# Instalar Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Crear archivo de configuración de supervisor para ejecutar ambos servicios
RUN mkdir -p /etc/supervisor/conf.d
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Crear y configurar Nginx como proxy inverso
RUN mkdir -p /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto (Nginx)
EXPOSE 80

# Comando de inicio - ejecutar supervisor para ambos servicios
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
