# Arquitectura

## Estado actual

El sitio público utiliza Next.js con App Router. Las rutas se encuentran en `app/`, los componentes visuales en `components/`, los datos demostrativos en `data/` y las utilidades compartidas en `lib/`.

Rutas públicas actuales:

- `/`
- `/propiedades`
- `/propiedades/[slug]`
- `/tasaciones`

## Estructura prevista

En próximos sprints, y solo cuando exista una implementación real que versionar, se podrá extender el proyecto con:

- `app/admin/`: interfaz administrativa.
- `app/api/`: endpoints del servidor.
- `db/`: configuración y acceso a datos.
- `types/`: tipos compartidos de dominio.

Esta estructura es una referencia de organización. En el Sprint 1 no se crean pantallas, endpoints, conexiones externas, autenticación ni archivos placeholder.
