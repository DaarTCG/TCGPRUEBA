# Cómo contribuir

1. Crea una rama desde `main`: `git checkout -b feat/mi-cambio`.
2. Instala y prepara el proyecto: `npm install && npm run setup`.
3. Antes de abrir el pull request, verifica que todo pase:
   ```bash
   npm test
   npm run lint
   npm run build
   ```
4. Usa mensajes de commit claros: `feat:`, `fix:`, `docs:`, `test:`.
5. Si trabajas en pareja, agrega al final del commit:
   `Co-authored-by: Nombre <correo@ejemplo.com>`
