# Guía de Despliegue Corregida

## Problemas Encontrados

Tu script encontró varios problemas:

1. ❌ **Restricción de región**: Tu suscripción solo puede desplegar en ciertas regiones
2. ❌ **Docker no está corriendo**: No está disponible en tu PowerShell
3. ❌ **Errores en parámetros de Azure CLI**: Algunos comandos usan parámetros incorrectos

## Solución: Despliegue Simple (Sin Docker)

He creado un nuevo script `deploy-azure-simple.ps1` que es más simple y no depende de Docker.

### Requisitos

- Azure CLI (ya tienes)
- Git instalado
- Node.js instalado localmente (para pruebas)

### Pasos

#### 1. Ejecuta el nuevo script

```powershell
cd C:\Users\INGMS\Desktop\AnalizadorDatos\analizadordatos
.\deploy-azure-simple.ps1
```

**Nota**: Si pide región, cambia en el script a una disponible. Las más comunes son:
- `westeurope` (Europa Occidental)
- `northeurope` (Europa del Norte)
- `southcentralus` (Sur de EE.UU.)
- `eastus2` (Este de EE.UU. 2)

#### 2. Después de crear el App Service

```powershell
# Obtén la URL de despliegue Git
az webapp deployment source config-local-git `
    --name analizador-datos-app-unique `
    --resource-group rg-analizador-datos
```

Este comando te dará algo como:
```
https://analizador-datos@analizador-datos-app-unique.scm.azurewebsites.net/analizador-datos-app-unique.git
```

#### 3. Configura Git en tu repositorio local

```powershell
cd C:\Users\INGMS\Desktop\AnalizadorDatos\analizadordatos

# Agregar remoto de Azure
git remote add azure https://analizador-datos@analizador-datos-app-unique.scm.azurewebsites.net/analizador-datos-app-unique.git

# Hacer push al servidor
git push azure main
```

#### 4. Monitorea el despliegue

```powershell
# Ver logs en tiempo real
az webapp log tail `
    --name analizador-datos-app-unique `
    --resource-group rg-analizador-datos
```

---

## Alternativa: Despliegue con Docker (Si Docker está corriendo)

Si instalas Docker Desktop y lo pones a correr, entonces:

1. Inicia Docker Desktop
2. Vuelve a ejecutar `deploy-azure.ps1`

---

## Cambiar Nombre Único

Si `analizador-datos-app-unique` ya existe en Azure, cámbialo en el script a algo como:
- `analizador-datos-app-tu-nombre`
- `analizador-datos-app-12345`

Debe ser único globalmente en Azure.

---

## Ver tu App

Una vez desplegada, accede a:
```
https://analizador-datos-app-unique.azurewebsites.net
```

---

## Limpiar (Si algo sale mal)

```powershell
az group delete --name rg-analizador-datos --yes
```

Esto elimina todo (Resource Group, App Service, etc.)

---

¿Necesitas ayuda con algún paso?
