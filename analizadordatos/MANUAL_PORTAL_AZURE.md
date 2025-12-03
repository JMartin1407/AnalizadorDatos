# GUÍA MANUAL - Crear App Service en Azure Portal

Debido a problemas con Azure CLI en tu máquina, vamos a hacerlo manualmente desde el Portal de Azure.

## Ya tienes creado:
✓ Resource Group: rg-analizador-datos-mx (mexicocentral)
✓ App Service Plan: plan-analizador-datos-mx

## Pasos para crear el App Service manualmente:

### 1. Abre Azure Portal
https://portal.azure.com

### 2. Busca "App Service" y haz clic en "Create"

### 3. Completa los datos:
- **Subscription**: Tu suscripción actual
- **Resource Group**: rg-analizador-datos-mx
- **Name**: analizador-datos-mx (o analizador-datos-app-mx)
- **Runtime**: Node.js 20 LTS
- **Operating System**: Linux
- **Region**: Mexico Central
- **App Service Plan**: plan-analizador-datos-mx

### 4. Haz clic en "Review + create" y luego "Create"

### 5. Espera a que se cree (5-10 minutos)

### 6. Una vez creado, ve a la sección "Deployment Center"

### 7. Selecciona:
- Source: Local Git
- Haz clic en "Save"

### 8. Obtén la URL de Git desde "Deployment credentials"

## Alternativa - Usar Portal para todo:

Si prefieres, puedes hacer todo desde el Portal sin usar CLI.

¿Necesitas ayuda con algún paso?
