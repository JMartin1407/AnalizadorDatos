# Guía de Despliegue a Azure App Service

## Descripción General
Esta aplicación es una combinación de **Next.js (Frontend)** y **Backend en Python**, por lo que usaremos Docker para despliegue en Azure.

## Opciones de Despliegue

### **OPCIÓN 1: Despliegue Automático con Docker (RECOMENDADO)**

#### Requisitos previos:
1. **Azure CLI** - [Descargar aquí](https://learn.microsoft.com/es-es/cli/azure/install-azure-cli)
2. **Docker Desktop** - [Descargar aquí](https://www.docker.com/products/docker-desktop)
3. **Una suscripción de Azure activa**

#### Pasos:

**1. Abre PowerShell como Administrador** y ejecuta:

```powershell
# Navega a la carpeta del proyecto
cd C:\Users\INGMS\Desktop\AnalizadorDatos\analizadordatos

# Ejecuta el script de deployment
.\deploy-azure.ps1
```

El script automatizará:
- ✓ Crear Resource Group
- ✓ Crear App Service Plan
- ✓ Crear Azure Container Registry
- ✓ Construir la imagen Docker
- ✓ Subir la imagen a ACR
- ✓ Crear App Service
- ✓ Configurar variables de entorno

---

### **OPCIÓN 2: Despliegue Manual paso a paso**

#### 1. Autenticarse en Azure
```powershell
az login
```

#### 2. Crear Resource Group
```powershell
az group create `
    --name rg-analizador-datos `
    --location eastus
```

#### 3. Crear App Service Plan
```powershell
az appservice plan create `
    --name plan-analizador-datos `
    --resource-group rg-analizador-datos `
    --is-linux `
    --sku B1
```

#### 4. Crear Azure Container Registry
```powershell
az acr create `
    --resource-group rg-analizador-datos `
    --name analizadordatos `
    --sku Basic
```

#### 5. Construir y subir imagen Docker
```powershell
# Obtener el servidor de login
$loginServer = az acr show --name analizadordatos --resource-group rg-analizador-datos --query loginServer --output tsv

# Autenticarse en ACR
az acr login --name analizadordatos

# Construir imagen
docker build -t $loginServer/analizadordatos:latest .

# Subir imagen
docker push $loginServer/analizadordatos:latest
```

#### 6. Crear App Service
```powershell
az webapp create `
    --resource-group rg-analizador-datos `
    --plan plan-analizador-datos `
    --name analizador-datos-app `
    --deployment-container-image-name-user analizadordatos `
    --docker-custom-image-name "$loginServer/analizadordatos:latest"
```

#### 7. Configurar credenciales de ACR
```powershell
$registryUsername = az acr credential show --name analizadordatos --query username -o tsv
$registryPassword = az acr credential show --name analizadordatos --query passwords[0].value -o tsv

az webapp config container set `
    --name analizador-datos-app `
    --resource-group rg-analizador-datos `
    --docker-registry-server-url "https://$loginServer" `
    --docker-registry-server-user $registryUsername `
    --docker-registry-server-password $registryPassword
```

#### 8. Configurar variables de entorno
```powershell
az webapp config appsettings set `
    --name analizador-datos-app `
    --resource-group rg-analizador-datos `
    --settings `
    WEBSITES_PORT=3000 `
    NODE_ENV=production
```

---

## Después del Despliegue

### Ver la aplicación
```powershell
# Obtener la URL
az webapp show `
    --name analizador-datos-app `
    --resource-group rg-analizador-datos `
    --query "defaultHostName" `
    --output tsv

# La URL será: https://analizador-datos-app.azurewebsites.net
```

### Ver logs en tiempo real
```powershell
az webapp log tail `
    --name analizador-datos-app `
    --resource-group rg-analizador-datos
```

### Reiniciar la aplicación
```powershell
az webapp restart `
    --name analizador-datos-app `
    --resource-group rg-analizador-datos
```

---

## Solución de Problemas

### Error: "No estás autenticado"
```powershell
az login
```

### Error: "Docker image not found"
Asegúrate de que la imagen se subió correctamente:
```powershell
az acr repository list --name analizadordatos --output table
```

### Error: "WEBSITES_PORT"
Asegúrate de que tu aplicación escucha en el puerto 3000.

### Logs de error en la aplicación
```powershell
az webapp log tail --name analizador-datos-app --resource-group rg-analizador-datos
```

---

## Notas Importantes

1. **Nombre único**: `analizador-datos-app` debe ser único globalmente en Azure. Si ya existe, cámbialo.

2. **SKU del Plan**: 
   - `B1` (Basic) - Suficiente para desarrollo/pruebas
   - `S1/S2` (Standard) - Recomendado para producción
   - `P1V2` (Premium) - Para alto tráfico

3. **Región**: `eastus` es una opción. Puedes cambiarla a `westeurope`, `southcentralus`, etc.

4. **Actualizar la aplicación**:
   ```powershell
   # Después de hacer cambios:
   docker build -t $loginServer/analizadordatos:latest .
   docker push $loginServer/analizadordatos:latest
   
   # Reiniciar App Service para que tome la nueva imagen
   az webapp restart --name analizador-datos-app --resource-group rg-analizador-datos
   ```

---

## Limpiar recursos (si necesitas eliminar todo)
```powershell
az group delete --name rg-analizador-datos --yes
```

---

¡Listo! Sigue estos pasos y tu aplicación estará en Azure. 🚀
