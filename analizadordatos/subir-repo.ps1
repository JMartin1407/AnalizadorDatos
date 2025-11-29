# Script para subir todos los cambios al repositorio remoto

# Cambia al directorio del repositorio (ajusta la ruta si es necesario)
cd "C:\Users\INGMS\Desktop\AnalizadorDatos\analizadordatos\estemero"

# Agrega todos los archivos modificados y nuevos
git add .

# Crea un commit con un mensaje automático (puedes cambiar el mensaje)
$mensaje = "Auto-commit: cambios locales subidos el $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m "$mensaje"

# Sube los cambios a la rama actual en el remoto
git push origin HEAD