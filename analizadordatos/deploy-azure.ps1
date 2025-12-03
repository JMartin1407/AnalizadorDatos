# Script para desplegar AnalizadorDatos a Azure App Service
# Requisitos: Azure CLI instalado y autenticado

param(
    [string]$ResourceGroup = "rg-analizador-datos",
    [string]$AppServicePlan = "plan-analizador-datos",
    [string]$AppServiceName = "analizador-datos-app",
    [string]$Location = "eastus",
    [string]$RegistryName = "analizadordatos"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY DE ANALIZADOR DATOS A AZURE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Verificar autenticacion
Write-Host "Verificando autenticacion en Azure..." -ForegroundColor Yellow
$account = az account show --query id -o tsv
if ($null -eq $account) {
    Write-Host "No autenticado. Iniciando az login..." -ForegroundColor Red
    az login
} else {
    Write-Host "Autenticado correctamente" -ForegroundColor Green
}

# PASO 2: Crear Resource Group
Write-Host "`n[PASO 2] Creando Resource Group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location
Write-Host "Resource Group creado" -ForegroundColor Green

# PASO 3: Crear App Service Plan
Write-Host "`n[PASO 3] Creando App Service Plan..." -ForegroundColor Yellow
az appservice plan create --name $AppServicePlan --resource-group $ResourceGroup --is-linux --sku B1
Write-Host "App Service Plan creado" -ForegroundColor Green

# PASO 4: Crear Azure Container Registry
Write-Host "`n[PASO 4] Creando Azure Container Registry..." -ForegroundColor Yellow
az acr create --resource-group $ResourceGroup --name $RegistryName --sku Basic
Write-Host "Container Registry creado" -ForegroundColor Green

# PASO 5: Obtener login server
Write-Host "`n[PASO 5] Obteniendo credenciales de ACR..." -ForegroundColor Yellow
$loginServer = az acr show --name $RegistryName --resource-group $ResourceGroup --query loginServer -o tsv
Write-Host "Login Server: $loginServer" -ForegroundColor Yellow

# PASO 6: Construir imagen Docker
Write-Host "`n[PASO 6] Construyendo imagen Docker..." -ForegroundColor Yellow
docker build -t $loginServer/analizadordatos:latest .
Write-Host "Imagen construida" -ForegroundColor Green

# PASO 7: Autenticarse en ACR
Write-Host "`n[PASO 7] Autenticandose en ACR..." -ForegroundColor Yellow
az acr login --name $RegistryName
Write-Host "Autenticado en ACR" -ForegroundColor Green

# PASO 8: Subir imagen
Write-Host "`n[PASO 8] Subiendo imagen a ACR..." -ForegroundColor Yellow
docker push $loginServer/analizadordatos:latest
Write-Host "Imagen subida" -ForegroundColor Green

# PASO 9: Obtener credenciales de ACR
Write-Host "`n[PASO 9] Obteniendo credenciales de ACR..." -ForegroundColor Yellow
$registryUsername = az acr credential show --name $RegistryName --query username -o tsv
$registryPassword = az acr credential show --name $RegistryName --query passwords[0].value -o tsv

# PASO 10: Crear App Service
Write-Host "`n[PASO 10] Creando App Service..." -ForegroundColor Yellow
az webapp create --resource-group $ResourceGroup --plan $AppServicePlan --name $AppServiceName --deployment-container-image-name-user $registryUsername --deployment-container-image-name-password $registryPassword --docker-custom-image-name "$loginServer/analizadordatos:latest"
Write-Host "App Service creado" -ForegroundColor Green

# PASO 11: Configurar App Service
Write-Host "`n[PASO 11] Configurando App Service..." -ForegroundColor Yellow
az webapp config container set --name $AppServiceName --resource-group $ResourceGroup --docker-custom-image-name "$loginServer/analizadordatos:latest" --docker-registry-server-url "https://$loginServer" --docker-registry-server-user $registryUsername --docker-registry-server-password $registryPassword
Write-Host "App Service configurado" -ForegroundColor Green

# PASO 12: Configurar variables de entorno
Write-Host "`n[PASO 12] Configurando variables de entorno..." -ForegroundColor Yellow
az webapp config appsettings set --name $AppServiceName --resource-group $ResourceGroup --settings WEBSITES_PORT=3000 NODE_ENV=production
Write-Host "Variables de entorno configuradas" -ForegroundColor Green

# RESUMEN
$appUrl = "https://$AppServiceName.azurewebsites.net"
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DESPLIEGUE COMPLETADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "URL de tu app: $appUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Ver logs:" -ForegroundColor Yellow
Write-Host "az webapp log tail --name $AppServiceName --resource-group $ResourceGroup" -ForegroundColor Gray
Write-Host ""
