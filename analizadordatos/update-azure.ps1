# Script rápido para actualizar despliegue en Azure después de cambios locales
# Uso: .\update-azure.ps1

param(
    [string]$ResourceGroup = "rg-analizador-datos",
    [string]$AppServiceName = "analizador-datos-app",
    [string]$RegistryName = "analizadordatos"
)

$loginServer = "$RegistryName.azurecr.io"

Write-Host "Actualizando imagen en Azure..." -ForegroundColor Cyan

# Autenticarse en ACR
Write-Host "Autenticándose en ACR..." -ForegroundColor Yellow
az acr login --name $RegistryName

# Construir nueva imagen
Write-Host "Construyendo imagen Docker..." -ForegroundColor Yellow
docker build -t $loginServer/analizadordatos:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al construir imagen" -ForegroundColor Red
    exit 1
}

# Subir imagen
Write-Host "Subiendo imagen a ACR..." -ForegroundColor Yellow
docker push $loginServer/analizadordatos:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir imagen" -ForegroundColor Red
    exit 1
}

# Reiniciar App Service
Write-Host "Reiniciando App Service..." -ForegroundColor Yellow
az webapp restart `
    --name $AppServiceName `
    --resource-group $ResourceGroup

Write-Host "✓ ¡Actualización completada!" -ForegroundColor Green
Write-Host "La aplicación se está reiniciando. Espera 1-2 minutos..." -ForegroundColor Yellow
