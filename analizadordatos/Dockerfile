FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias y compilar
RUN npm ci
RUN npm run build

# Stage final - Python + Node runtime
FROM python:3.13-slim

WORKDIR /app

# Instalar Node.js (runtime solamente)
RUN apt-get update && apt-get install -y nodejs npm curl && rm -rf /var/lib/apt/lists/*

# Copiar Next.js build desde builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Copiar archivos de la app
COPY requirements.txt .
COPY package.json package-lock.json ./
COPY src ./src
COPY backend ./backend
COPY run_server.py .

# Instalar Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Exponer puertos
EXPOSE 8000

# Comando de inicio - ejecutar solo FastAPI (Next.js se sirve como static)
CMD ["python", "run_server.py"]
