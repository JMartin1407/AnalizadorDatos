# Script para limpiar recursos anteriores

Write-Host "Limpiando recursos anteriores..." -ForegroundColor Yellow

# Eliminar Resource Group anterior
Write-Host "Eliminando Resource Group: rg-analizador-datos" -ForegroundColor Yellow
az group delete --name rg-analizador-datos --yes --no-wait

Write-Host ""
Write-Host "Los recursos se están eliminando en segundo plano..." -ForegroundColor Green
Write-Host "Puedes continuar con el despliegue en Mexico Central" -ForegroundColor Green
Write-Host ""
