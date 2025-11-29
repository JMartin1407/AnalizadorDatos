#!/usr/bin/env python
"""Script para ejecutar el servidor FastAPI en Azure."""
import os

if __name__ == "__main__":
    import uvicorn
    from backend.main import app
    
    # Obtener puerto de Azure o usar 8000 por defecto
    port = int(os.environ.get('PORT', 8000))
    
    print(f"[*] Iniciando servidor en puerto {port}...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
