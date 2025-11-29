#!/usr/bin/env python
"""Script para ejecutar el servidor FastAPI."""

if __name__ == "__main__":
    import uvicorn
    from backend.main import app
    
    print("[*] Iniciando servidor...")
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
