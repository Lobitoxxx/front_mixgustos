# front_mixgustos

Frontend React de MixGustos (plan F1–F3; portal del cliente diferido a la
respuesta del arquitecto sobre portal anónimo y pagos).

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173 (proxy /api-prefijos → :8080)
npm run build      # verificación de tipos + bundle
```

Requiere el backend `project_mixgustos` corriendo en `http://localhost:8080`.

## Arquitectura

- **Un solo SPA** con 4 experiencias del plano (§2.2) como ámbitos de ruta:
  - `/admin/**` — experiencia A (propietario, administrador, contador): sidebar
  - `/op/**` — experiencia B (almacén, caja, salón): una tarea por pantalla
  - `/kitchen/**` — experiencia D (cocina y despacho): tablero fullscreen
  - `/` portal cliente (experiencia C): diferido (F4)
- **Menú por permisos**: cada entrada declara su código de permiso del backend;
  la navegación es una proyección de `/auth/me` (§7.1: ocultar menús no es autorización).
- **Shell adaptativo** por experiencia; actualización de tableros por *polling* (v1).
- `src/api/client.ts` mapea el error estándar `{ error: { code, message } }`;
  401 limpia la sesión y muestra login.

## Fases

| Fase | Contenido | Estado |
|---|---|---|
| F1 | Base: login, sesión, guardas por permiso, shells, navegación | ✅ |
| F2 | Experiencia operativa: POS, salón, recepción, cocina, despacho | planeada |
| F3 | Experiencia administrativa: reportes, auditoría, aprobaciones, settings | planeada |
| F4 | Portal del cliente | diferida al arquitecto |
