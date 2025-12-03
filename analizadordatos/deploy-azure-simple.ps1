# Desplegar AnalizadorDatos a Azure App Service
# Region: Mexico Central

param(
    [string]$ResourceGroup = "rg-analizador-datos-mx",
    [string]$AppServicePlan = "plan-analizador-datos-mx",
    [string]$AppServiceName = "analizador-datos-mx",
    [string]$Location = "mexicocentral"
)

Write-Host "========================================"
Write-Host "DEPLOY A AZURE - MEXICO CENTRAL"
Write-Host "========================================"
Write-Host ""

# Funcion para verificar errores
function CheckError {
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR en el comando anterior" -ForegroundColor Red
        exit 1
    }
}

# Paso 1: Autenticacion
Write-Host "[1/4] Verificando autenticacion..." -ForegroundColor Yellow
$account = az account show --query id -o tsv
CheckError
Write-Host "OK - Autenticado" -ForegroundColor Green

# Paso 2: Crear Resource Group
Write-Host ""
Write-Host "[2/4] Creando Resource Group: $ResourceGroup" -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location
CheckError
Write-Host "OK - Resource Group creado" -ForegroundColor Green

# Paso 3: Crear App Service Plan
Write-Host ""
Write-Host "[3/4] Creando App Service Plan: $AppServicePlan" -ForegroundColor Yellow
az appservice plan create --name $AppServicePlan --resource-group $ResourceGroup --is-linux --sku B1
CheckError
Write-Host "OK - App Service Plan creado" -ForegroundColor Green

# Paso 4: Crear App Service
Write-Host ""
Write-Host "[4/4] Creando App Service: $AppServiceName" -ForegroundColor Yellow
az webapp create --resource-group $ResourceGroup --plan $AppServicePlan --name $AppServiceName
CheckError
Write-Host "OK - App Service creado" -ForegroundColor Green

# Configurar variables de entorno
Write-Host ""
Write-Host "Configurando variables de entorno..." -ForegroundColor Yellow
az webapp config appsettings set --resource-group $ResourceGroup --name $AppServiceName --settings WEBSITES_PORT=3000 NODE_ENV=production
CheckError

# Configurar Git

# Resumen
Write-Host ""
Write-Host "========================================"
Write-Host "DESPLIEGUE COMPLETADO"
Write-Host "========================================"
Write-Host ""
Write-Host "URL: https://$AppServiceName.azurewebsites.net" -ForegroundColor Green
Write-Host "Nombre: $AppServiceName" -ForegroundColor Green
Write-Host "Region: $Location" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMO PASO - Para desplegar tu codigo:"
Write-Host ""
Write-Host "1. Ve a tu carpeta del proyecto"
Write-Host "2. Obtén la URL de Git:"
Write-Host "   az webapp deployment source config-local-git --name $AppServiceName --resource-group $ResourceGroup"
Write-Host ""
Write-Host "3. Configura el remoto:"
Write-Host "   git remote add azure <URL-obtenida>"
Write-Host ""
Write-Host "4. Sube tu codigo:"
Write-Host "   git push azure main"
Write-Host ""
