# Requisitos No Funcionales — Clínica Angry

Los requisitos no funcionales (RNF) definen la calidad del sistema: rendimiento, seguridad, usabilidad, mantenibilidad y despliegue. Se codifican como `RNF-<area>-###` con prioridad MoSCoW.

## 1. Arquitectura y tecnología

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-ARQ-001 | El sistema debe tener arquitectura **monorepo** con `backend/`, `frontend/` y pruebas E2E en directorios separados. | M |
| RNF-ARQ-002 | El backend debe ser una **API REST** con respuestas JSON consistentes y versionada (`/api/v1/`). | M |
| RNF-ARQ-003 | El backend debe ser modular por dominio (apps Django: authentication, users, patients, doctors, specialties, schedules, appointments, notifications, audit). | M |
| RNF-ARQ-004 | El frontend debe ser una **SPA** por features (auth, patients, doctors, specialties, schedules, appointments, dashboard). | M |
| RNF-ARQ-005 | El sistema debe documentarse con **OpenAPI/Swagger** en `/api/v1/docs/`. | M |
| RNF-ARQ-006 | Debe existir un **health endpoint** (`/api/v1/health/`) que reporte estado y conexión a la BD. | M |

## 2. Seguridad

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-SEG-001 | La autenticación debe usar **JWT** (access + refresh). | M |
| RNF-SEG-002 | Las contraseñas deben almacenarse con hash (passwords hashing de Django). | M |
| RNF-SEG-003 | Los recursos protegidos deben validar permisos por **rol** en el backend (RBAC). | M |
| RNF-SEG-004 | Las claves secretas nunca deben commitearse (`.env` en `.gitignore`; valores por defecto solo para dev). | M |
| RNF-SEG-005 | **CORS** debe configurarse por entorno con orígenes permitidos. | M |
| RNF-SEG-006 | El frontend debe redirigir a login ante recursos no autorizados (guard de rol). | M |
| RNF-SEG-007 | La API no debe exponer datos sensibles en listados a otros roles (solo las propias citas del paciente, por ejemplo). | M |

## 3. Rendimiento, escalabilidad y disponibilidad

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-PER-001 | Los listados de citas deben poder consultarse con filtros por fecha, médico, paciente y estado. | S |
| RNF-PER-002 | Las consultas de la cita deben proteger campos de fecha/hora con índices de BD. | S |
| RNF-PER-003 | El uso de BD en un entorno de desarrollo debe ser **PostgreSQL** (configurable). | M |
| RNF-PER-004 | La respuesta del health endpoint debe ser < 1 s en condiciones normales. | M |
| RNF-PER-005 | El sistema debe levantar y operar en el stack Docker Compose con multi-entorno (dev/prod). | M |

## 4. Usabilidad y accesibilidad

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-UX-001 | La UI debe ser **responsive** (funcionar en escritorio, tablet y móvil). | M |
| RNF-UX-002 | La UI debe cumplir **accesibilidad básica**: contraste, foco visible y etiquetas en formularios. | S |
| RNF-UX-003 | Los mensajes de error deben ser claros y orientados a la acción (validaciones de formulario). | M |
| RNF-UX-004 | Los estados de cita deben mostrarse con **badges** de color para lectura rápida. | S |
| RNF-UX-005 | Los flujos críticos (reserva, cancelación, confirmación) deben confirmarse con diálogos de confirmación. | M |

## 5. Mantenibilidad y calidad de código

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-CAL-001 | El backend debe pasar **lint/checks** en CI (ruff). | M |
| RNF-CAL-002 | El frontend debe pasar **lint** (eslint) y **typecheck** (TypeScript) en CI. | M |
| RNF-CAL-003 | Debe existir `requirements.txt`/`pyproject.toml` y `package.json` con scripts estándar (`dev`, `test`, `lint`, `build`). | M |
| RNF-CAL-004 | El código debe documentar comandos de instalación y ejecución en el README. | M |
| RNF-CAL-005 | El log de auditoría (`AuditLog`) debe registrar acciones importantes con metadata JSON. | S |

## 6. Testing y cobertura

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-TST-001 | El backend debe cubrir con pruebas unitarias y de integración: autenticación, disponibilidad, reserva, solapamiento, cancelación, transiciones de estado y permisos. | M |
| RNF-TST-002 | Cobertura de **líneas ≥ 85 %** en módulos críticos del backend (pytest-cov). | M |
| RNF-TST-003 | El frontend debe cubrir con Vitest + React Testing Library: login, validación de email/contraseña, formulario de cita, render de estados y guard de rol. | M |
| RNF-TST-004 | Cobertura **≥ 80 %** en componentes/features críticos del frontend. | M |
| RNF-TST-005 | La suite E2E (Playwright) debe cubrir los flujos: paciente reserva, médico confirma, paciente cancela, admin gestiona médico, acceso no autorizado bloqueado. | S |
| RNF-TST-006 | Los reportes de cobertura deben poder generarse en **HTML** localmente y en CI. | S |
| RNF-TST-007 | Las reglas de negocio críticas (RBN-1 a RBN-10) deben tener al menos un test que las valide en backend. | M |
| RNF-TST-008 | Deben aplicarse técnicas de diseño de casos: partición de equivalencia, valores límite, tablas de decisión y máquina de estados. | M |

## 7. Despliegue y operación

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-OP-001 | El sistema debe poder ejecutarse con **Docker Compose** (`docker compose up --build`). | M |
| RNF-OP-002 | El arranque vía Compose debe aplicar migraciones y seed de datos demo automáticamente. | M |
| RNF-OP-003 | Deben existir archivos `.env.example` y `.env` no versionado con valores de entorno. | M |
| RNF-OP-004 | Deben existir credenciales de demo generadas por el **seed** (`manage.py seed_demo`) sin datos reales. | M |
| RNF-OP-005 | La configuración debe soportar entornos dev y prod (override/prod compose). | S |
| RNF-OP-006 | Debe existir **CI/CD** (GitHub Actions) que ejecute en cada push/PR: lint backend, tests+cobertura backend, lint frontend, tests+cobertura frontend, build frontend y build Docker. | M |

## 8. Compatibilidad

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-COM-001 | Node.js 20+ y Python 3.12+ como versiones de referencia (documentadas). | M |
| RNF-COM-002 | La API debe consumirse por el frontend vía `VITE_API_URL` configurable. | M |
| RNF-COM-003 | PostgreSQL 16 como BD de referencia en Docker. | M |

## 9. Negativos del sistema

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RNF-NEG-001 | Ante un slot ocupado, la API debe responder 409/400 con mensaje claro y el frontend debe mostrarlo. | M |
| RNF-NEG-002 | Ante credenciales inválidas, la API debe responder 401 sin revelar qué campo falló. | M |
| RNF-NEG-003 | Ante acceso no autorizado, la API debe responder 403 y el frontend redirigir a login/dashboard. | M |