# CLÍNICA ANGRY — SISTEMA DE GESTIÓN DE CITAS MÉDICAS

## Descripción

Proyecto académico de Pruebas de Software (APF1). Sistema web completo para administrar pacientes, médicos, especialidades, disponibilidad y citas médicas de la **Clínica Angry**, diseñado desde el inicio para pruebas unitarias, de integración, API, E2E, cobertura y CI/CD.

Regla principal del proyecto: **no crear un prototipo vacío ni mocks como sustituto del sistema real**. El sistema debe implementar frontend, backend, PostgreSQL, autenticación, Docker y pruebas ejecutables.

## Roles

- **Paciente**: registrarse, iniciar/cerrar sesión, ver y editar perfil, ver especialidades, buscar médicos, consultar disponibilidad, reservar/ver/cancelar citas, ver historial, recibir confirmaciones.
- **Médico**: iniciar sesión, ver perfil, gestionar disponibilidad, ver agenda, confirmar/rechazar citas, marcar citas como atendidas/no atendidas, consultar historial.
- **Administrador**: gestionar usuarios, pacientes, médicos, especialidades, horarios y citas; consultar auditoría básica y ver dashboard con métricas.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + pnpm |
| Backend | Django + Django REST Framework + uv |
| Base de datos | PostgreSQL |
| Auth | JWT |
| Testing backend | pytest + pytest-django + pytest-cov |
| Testing frontend | Vitest + React Testing Library |
| E2E | Playwright |
| CI/CD | GitHub Actions |
| Infraestructura | Docker Compose |
| API | Documentada con OpenAPI/Swagger |

## Arquitectura

Monorepo:

```
proyecto-pruebas/
├── frontend/            # React + TypeScript + Vite + Tailwind
├── backend/             # Django + DRF + uv
├── tests/e2e/           # Playwright
├── docker/              # Dockerfiles y config de contenedores
├── docs/                # Documentación y matriz de pruebas
└── .github/workflows/   # CI/CD (ci.yml)
```

Backend modular por dominio: `authentication`, `users`, `patients`, `doctors`, `specialties`, `schedules`, `appointments`, `notifications`, `audit`.

Frontend por features: `auth`, `patients`, `doctors`, `specialties`, `schedules`, `appointments`, `dashboard`.

## Requisitos

- Docker Desktop / Docker Engine con Compose.

## Inicio rápido

1. Clonar el repositorio.
2. Copiar `.env.example` a `.env`.
3. Ejecutar:

```bash
docker compose up --build
```

4. Ejecutar migraciones:

```bash
docker compose exec backend uv run python manage.py migrate
```

5. Ejecutar seed de datos de demostración:

```bash
docker compose exec backend uv run python manage.py seed_demo
```

6. Abrir el frontend en el navegador.
7. Abrir Swagger de la API.

## Comandos

### Docker

```bash
docker compose up --build
docker compose down
docker compose logs -f
docker compose exec backend uv run python manage.py migrate
docker compose exec backend uv run python manage.py seed_demo
```

### Backend (uv)

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py seed_demo
uv run pytest
```

### Frontend (pnpm)

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
```

## Testing

- **Unitarias backend**: autenticación/validadores, disponibilidad, reserva válida, fecha pasada, slot ocupado, cancelación dentro/fuera de ventana, transiciones de estado, permisos.
- **Unitarias frontend**: login, validación de email, validación de contraseña, formulario de cita, render de estados, guard de rol.
- **Integración (API + BD)**: login, creación de paciente, creación de cita, persistencia PostgreSQL, conflicto de horario, cancelación, permisos, actualización de estado.
- **E2E (Playwright)**: paciente reserva, médico confirma, paciente cancela, admin gestiona médico, acceso no autorizado bloqueado.
- **Cobertura**: porcentaje de líneas, branches cuando la herramienta lo permita y reporte HTML. Objetivos: >= 85% en módulos críticos del backend y >= 80% en componentes/features críticos del frontend.

Se aplican técnicas de diseño de casos: partición de equivalencia, análisis de valores límite, tablas de decisión, casos positivos/negativos, pruebas de autorización y de errores.

## Reglas de negocio críticas

1. No se puede reservar en el pasado.
2. No se puede reservar fuera de la disponibilidad del médico.
3. No se permiten dos citas activas que ocupen el mismo slot para el mismo médico.
4. Un paciente no puede tener dos citas simultáneas.
5. Las cancelaciones deben respetar una ventana configurable.
6. Solo usuarios autorizados pueden acceder a recursos protegidos.
7. Un médico solo puede modificar su propia disponibilidad.
8. Un administrador puede gestionar todos los recursos.
9. Los estados de cita siguen una máquina de estados válida:

```
PENDIENTE -> CONFIRMADA -> ATENDIDA
PENDIENTE -> CANCELADA
CONFIRMADA -> CANCELADA
CONFIRMADA -> NO_ASISTIO
```

10. Todas las reglas se validan en backend.

## Credenciales de demo

Solo se usarán credenciales artificiales de desarrollo (generadas por el `seed_demo`). Nunca se incluyen credenciales reales.

## CI/CD

GitHub Actions ejecuta en cada push y Pull Request: lint/checks del backend, tests + cobertura del backend, instalación y lint del frontend, tests + cobertura del frontend, build del frontend, build Docker, tests de integración/API y E2E.

## Calidad

Este proyecto está diseñado para demostrar:

- pruebas unitarias;
- pruebas de integración;
- E2E;
- cobertura;
- automatización;
- CI/CD;
- Docker reproducible.

Cada funcionalidad importante debe tener pruebas. No se declara una tarea terminada si no compila, no arranca o sus pruebas fallan.

## Estado

En desarrollo. No se declara "production ready" hasta ejecutar la validación completa desde un entorno limpio (`docker compose build`, `up`, `migrate`, `seed`, smoke test, unit, integration, frontend, E2E, coverage y CI).