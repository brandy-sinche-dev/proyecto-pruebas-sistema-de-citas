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
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + pnpm (o npm) |
| Backend | Django + Django REST Framework + uv (o pip/python) |
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
├── backend/             # Django + DRF + uv/pip + requirements.txt
├── tests/e2e/           # Playwright
├── docker/              # Dockerfiles y config de contenedores
├── docs/                # Documentación y matriz de pruebas
└── .github/workflows/   # CI/CD (ci.yml)
```

Backend modular por dominio: `authentication`, `users`, `patients`, `doctors`, `specialties`, `schedules`, `appointments`, `notifications`, `audit`.

Frontend por features: `auth`, `patients`, `doctors`, `specialties`, `schedules`, `appointments`, `dashboard`.

## Requisitos

Ejecutar con contenedores:

- Docker Desktop / Docker Engine con Compose.

Ejecutar en local sin Docker (ver más abajo):

- Node.js 20+ y **npm** (gestor de paquetes frontend) — pnpm es opcional.
- Python 3.12+ y **pip** (backend) — uv es opcional.
- PostgreSQL local (o SQLite para desarrollo rápido).

## Inicio rápido

### Con Docker (recomendado)

Los archivos `.env` nunca se suben al repositorio (ver `.gitignore`). Copiar `.env.example` a `.env` y ajustar los valores:

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

### Sin Docker (con npm y py, sin uv)

Alternativa en local, sin contenedores. El backend está preparado para ejecutarse tanto con `uv` como con `pip`/`python` (`backend/requirements.txt`), y el frontend con `npm` o `pnpm`.

> Compose dev ya ejecuta `migrate` y `seed_demo` automáticamente al arrancar. En local hay que hacerlos a mano (pasos 1 y 2).

**Backend (Python con pip, sin uv):**

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 0.0.0.0:8000
```

**Frontend (npm):**

```bash
cd frontend
npm install
npm run dev
```

**Tests, lint y build (npm):**

```bash
cd frontend
npm run lint
npm test
npm run test:coverage
npm run build
```

**Tests del backend (py, sin uv):**

```bash
cd backend
pip install -r requirements.txt
pytest
```

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

### Backend (Python con pip, sin uv)

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo
pytest
```

### Frontend (pnpm)

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm test:coverage
```

### Frontend (npm, sin pnpm)

Los comandos son los mismos declarados en `frontend/package.json`, ejecutados con `npm`:

```bash
npm run dev
npm run build
npm run lint
npm test
npm run test:coverage
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

GitHub Actions ejecuta en cada push y Pull Request: lint/checks del backend, tests + cobertura del backend, instalación y lint del frontend, tests + cobertura del frontend, build del frontend, build Docker y tests de integración/API. E2E (Playwright) se incorporará al pipeline cuando se configure la suite E2E.

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