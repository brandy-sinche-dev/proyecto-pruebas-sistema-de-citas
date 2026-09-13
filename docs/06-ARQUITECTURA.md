# Arquitectura — Clínica Angry

## 1. Visión general

Sistema web **monorepo** tipo SPA + API, con frontend React, backend Django REST y PostgreSQL, desplegable con Docker Compose y con pipeline de CI/CD.

```
┌──────────────────┐      HTTPS/JSON (JWT Bearer)      ┌─────────────────────┐
│   Browser        │ ───────────────────────────────► │   Backend API       │
│   React 19 SPA   │                                   │   Django + DRF      │
│   Vite + Tailwind│ ◄─────────────────────────────── │   /api/v1/          │
└──────────────────┘       JSON + errores              │   Swagger /docs/    │
         │                                              └─────────┬───────────┘
         │                                            PostgreSQL │
         │                                            ┌──────────▼───────────┐
         │                                            │   PostgreSQL 16      │
         │                                            └──────────────────────┘
```

## 2. Contexto por contenedores

| Servicio | Tecnología | Puerto | Rol |
| --- | --- | --- | --- |
| `frontend` | Node 20, Vite dev server | 5173 | SPA; proxy de API vía `VITE_API_URL` |
| `backend` | Python 3.13, Django 5.2 + DRF, uv | 8000 | API REST; migraciones y seed al arrancar |
| `db` | PostgreSQL 16 alpine | 5432 | Persistencia; volumen `postgres_data` |

Comunicación interna vía la red Docker `proyecto-pruebas_default`. `backend` depende de `db` (healthcheck `pg_isready`); `frontend` depende de `backend` (healthcheck `/api/v1/health/`).

## 3. Backend (Django + DRF)

### 3.1 Estructura modular por dominio

```
backend/
├── config/              # settings, urls, wsgi
├── apps/
│   ├── authentication/  # register, login, refresh, logout + health
│   ├── users/           # User (AbstractUser) + choices (roles/estados)
│   ├── patients/        # PatientProfile
│   ├── doctors/         # DoctorProfile
│   ├── specialties/     # Specialty
│   ├── schedules/       # Availability
│   ├── appointments/    # Appointment + clinical (Prescription, ConsultationNote, ClinicalExam, Medication) + dashboard
│   ├── boxes/           # Box (consultorios)
│   ├── finances/        # Insurance, Billing
│   ├── notifications/   # Notification
│   └── audit/           # AuditLog
```

### 3.2 Capas por app

- **models.py** — entidades y restricciones de BD (unique/check constraints).
- **views/serializers** — DRF: ViewSets con permisos por rol y validación de reglas de negocio en el serializer/servicio (RBN-10: **las reglas viven en backend**).
- **urls.py** — rutas `Router` registradas bajo `/api/v1/`.
- **services.py** — lógica de negocio reutilizable (p. ej. generación de códigos de cita, liquidación).
- **tests/** — pytest, pytest-django, pytest-cov.

### 3.3 API (resumen de rutas)

| Ruta | Métodos | Descripción |
| --- | --- | --- |
| `/api/v1/auth/register/` | POST | Registro de paciente |
| `/api/v1/auth/login/` | POST | Login → access + refresh |
| `/api/v1/auth/refresh/` | POST | Renueva access token |
| `/api/v1/auth/logout/` | POST | Cierre de sesión |
| `/api/v1/health/` | GET | Estado + BD |
| `/api/v1/appointments/` | CRUD | Citas (acceso por rol) |
| `/api/v1/consultation-notes/`, `/prescriptions/`, `/exams/` | CRUD | Atención clínica |
| `/api/v1/dashboard/summary/` | GET | Métricas operativas |
| `/api/v1/specialties/`, `/doctors/`, `/patients/`, `/schedules/`, `/boxes/`, `/finances/`, `/notifications/`, `/audit/`, `/users/` | CRUD | Módulos del sistema |
| `/api/v1/schema/`, `/api/v1/docs/` | GET | OpenAPI + Swagger UI |
| `/admin/` | — | Admin de Django |

## 4. Frontend (React + TypeScript)

### 4.1 Estructura por features

```
frontend/src/
├── features/
│   ├── auth/            # Login, Register, PasswordRecovery
│   ├── patient/         # Dashboard, Especialidades, Médicos, ReservarCita, Citas, Historial, Perfil
│   ├── doctor/          # Agenda, Disponibilidad, PacientesDelBox, RegistrosClínicos, Recetas
│   ├── reception/       # Dashboard, Citas, Pacientes, Médicos
│   ├── admin/           # Dashboard, Especialidades, Médicos, Pacientes, Horarios, Citas, Consultorios, Auditoría
│   └── layout/          # AppLayout, Sidebar, Header, routeGuards, navigation
├── services/            # http.ts (fetch/JWT), queries (TanStack Query)
├── schemas/             # validación de formularios
├── hooks/               # useAuth, useTransitionConfirm
├── components/ui/       # Button, Input, Modal, DataTable, Badge, KpiCard, ConfirmDialog...
└── lib/                 # utils, query client
```

### 4.2 Decisiones de frontend

- **Vite dev server** en modo dev; build de producción con `npm run build`.
- **Route guards por rol** (`routeGuards.tsx`) que redirigen según el rol del usuario.
- **Mock API** en tests (`services/mock/`) solo para pruebas unitarias de UI — el sistema real usa la API de Django.
- Estados de cita renderizados con **Badge** de color según estado.

## 5. Seguridad

- **JWT** (access + refresh) con headers `Authorization: Bearer`.
- **RBAC**: permisos por rol definidos en los ViewSets DRF. Reglas:
  - Paciente → solo sus propios recursos (citas, perfil, notificaciones).
  - Médico → su disponibilidad y su agenda (RBN-7).
  - Recepción → operación de mostrador.
  - Admin → acceso total (RBN-8).
- **Secretos** por `.env` (no versionado); valores dev por defecto en compose.
- CORS con orígenes permitidos por entorno.

## 6. Máquina de estados de cita (aplica en backend)

```
PENDING → CONFIRMED → CHECKED_IN → COMPLETED
PENDING → CANCELLED
CONFIRMED → CANCELLED
CONFIRMED → NO_SHOW
```

Implementada en el backend con validación en el serializer/transición; el frontend solo refleja estados y dispara acciones permitidas.

## 7. Decisiones de arquitectura (ADRs)

| ADR | Decision | Alternativas descartadas | Motivo |
| --- | --- | --- | --- |
| ADR-001 | Monorepo (backend + frontend + e2e) | Repos separados | Contexto académico; trazas cruzadas, CI único |
| ADR-002 | Django + DRF | FastAPI, Express | Madurez para DRF + admin + ORM; ecosistema pytest-django |
| ADR-003 | React + TypeScript + Vite | Next.js, CRA | SPA simple, build rápido, cobertura con RTL/Vitest |
| ADR-004 | PostgreSQL | SQLite en prod | Reglas de integridad, concurrencia y `UniqueConstraint(doctor, date)` |
| ADR-005 | JWT stateless | Sesiones server-side | Escalabilidad y práctica académica de tokens |
| ADR-006 | Docker Compose multi-servicio | Un solo contenedor | Reproducibilidad (RNF-OP-001) |
| ADR-007 | pytest + pytest-cov / Vitest + RTL | Mocha, Jest | Estándar del ecosistema y reportes de cobertura |
| ADR-008 | Playwright para E2E | Cypress | Integración con CI y multinavegador |
| ADR-009 | uv como gestor (con fallback pip) | Solo pip/poetry | Velocidad y lockfile; fallback documentado para alumnos |
| ADR-010 | Backend valida todas las reglas (RBN-10) | Validación solo en UI | La API no debe confiarse del cliente; base de las pruebas de reglas |

## 8. CI/CD pipeline (GitHub Actions)

```
push / pull_request
  └─ job backend:  ruff lint → pytest → pytest-cov (>= 85%) → build docker backend
  └─ job frontend: npm ci → lint → typecheck → vitest + coverage (>= 80%) → build
  └─ job e2e:      Playwright (cuando exista la suite)
```

## 9. Expandibilidad técnica

- Backend: agregar nuevos dominios como apps Django registradas en `config/urls.py`.
- Frontend: agregar features por rol y rutas en `navigation.tsx` + guards.
- BD: migraciones con Django; seed idempotente (`seed_demo`).
- Pruebas: cada regla de negocio tiene su test; cobertura reportada en HTML.