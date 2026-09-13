# Visión y Alcance

## 1. Contexto

La **Clínica Angry** es una clínica medica que actualmente gestiona sus citas de forma manual (agendas en papel, telefoneo, planillas), lo que genera dobles reservas, perdida de disponibilidad, cancelaciones fuera de plazo y una operacion dificil de auditar.

El proyecto consiste en construir un **sistema web completo de gestión de citas médicas** que centralice la oferta de especialidades, médicos, consultorios, disponibilidad y reservas, con roles diferenciados y reglas de negocio claras, diseñado **desde el inicio para pruebas** (unitarias, de integración, API, E2E, cobertura y CI/CD).

Regla principal del proyecto: **no crear un prototipo vacío ni mocks como sustituto del sistema real**. El sistema debe implementar frontend, backend, PostgreSQL, autenticación, Docker y pruebas ejecutables.

## 2. Objetivos del sistema

1. Permitir a los pacientes **reservar, consultar y cancelar citas** en línea sin intervención manual.
2. Permitir a los médicos **gestionar su disponibilidad y su agenda**, y registrar la atención clínica de sus pacientes (notas, recetas, exámenes).
3. Permitir a recepción y administración **operar la clínica** (pacientes, médicos, especialidades, consultorios, citas y facturación) en una única plataforma.
4. Garantizar que **todas las reglas de negocio críticas estén validadas en el backend** (no solo en la interfaz).
5. Estar preparado para **pruebas automatizadas y CI/CD** desde la primera iteración.

## 3. Objetivos académicos

- Practicar técnicas de diseño de casos de prueba: partición de equivalencia, análisis de valores límite, tablas de decisión y máquinas de estados.
- Cubrir testing unitario, de integración (API+BD), API y E2E con herramientas reales.
- Medir cobertura (backend ≥ 85 % en módulos críticos; frontend ≥ 80 % en componentes/features críticos).
- Mantener CI/CD que ejecute lint, tests, cobertura y build ante cada push/PR.

## 4. Alcance del sistema (Sprint 0 → producto)

### 4.1 Funcionalidad dentro del alcance

- Autenticación y gestión de sesión (registro, login, refresh, logout) con JWT.
- Perfiles por rol: **Paciente**, **Médico**, **Recepción**, **Administración**.
- Módulos: especialidades, médicos, pacientes, disponibilidad/horarios, consultorios/boxes, citas, agenda médica, atención clínica (notas, recetas, exámenes), notificaciones, facturación básica y auditoría.
- Dashboard con métricas operativas por rol.
- API REST documentada (OpenAPI/Swagger) y health endpoint.
- Backend: Django + Django REST Framework + PostgreSQL. Frontend: React + TypeScript + Vite + Tailwind.
- Despliegue reproducible con Docker Compose.
- Suite de pruebas ejecutable: pytest/pytest-cov (backend), Vitest + React Testing Library (frontend), Playwright (E2E).

### 4.2 Fuera del alcance (v1)

- Pagos en línea reales (pasarela externa): solo se registra el medio de pago (efectivo, POS, web) en la liquidación.
- Cuotas/Copago federal (Obra Social): la cobertura se modela como porcentaje por aseguradora, sin integración externa.
- Mensajería real (e-mail/SMS): las confirmaciones se implementan como notificaciones internas del sistema.
- Receta médica legal/firma electrónica.
- Módulo de inventario y farmacia.
- Módulo de RR.HH.
- App móvil nativa.
- Inteligencia artificial / triage automático.

### 4.3 Alcance de las pruebas

| Nivel | Cobertura esperada | Herramientas |
| --- | --- | --- |
| Unitario backend | autenticación, validadores, disponibilidad, reserva, cancelación, transiciones, permisos | pytest + pytest-django + pytest-cov |
| Integración | API + BD PostgreSQL | pytest |
| Unitario frontend | login, formularios, guard de rol, render de estados | Vitest + React Testing Library |
| E2E | flujos completos de paciente, médico y administrador | Playwright |
| Cobertura | backend ≥ 85 % crítico, frontend ≥ 80 % crítico | pytest-cov / c8 |

## 5. Stakeholders y actores

| Actor | Descripción | Interés principal |
| --- | --- | --- |
| **Paciente** | Persona que se atiende en la clínica | Reservar, ver y cancelar citas; ver su historial |
| **Médico** | Profesional de la clínica | Gestionar disponibilidad, agenda y atención clínica |
| **Recepción** | Personal administrativo de mostrador | Gestionar pacientes, médicos y citas del día; check-in |
| **Administrador** | Responsable de la operación | Gestión integral de catálogos, auditoría y métricas |
| Equipo de desarrollo | Estudiantes/desarrolladores | Implementar funcionalidad con pruebas |
| Docente (APF1) | Evaluador | Verificar calidad, pruebas y cumplimiento de reglas |

## 6. Reglas de negocio críticas (resumen)

1. No se puede reservar en el pasado.
2. No se puede reservar fuera de la disponibilidad del médico.
3. No se permiten dos citas activas que ocupen el mismo slot para el mismo médico.
4. Un paciente no puede tener dos citas simultáneas.
5. Las cancelaciones deben respetar una ventana configurable.
6. Solo usuarios autorizados pueden acceder a recursos protegidos.
7. Un médico solo puede modificar su propia disponibilidad.
8. Un administrador puede gestionar todos los recursos.
9. Los estados de cita siguen una máquina de estados válida.
10. Todas las reglas se validan en backend.

Detalle en [Requisitos funcionales](./03-REQUISITOS-FUNCIONALES.md).

## 7. Indicadores de éxito

- 100 % de las HU del alcance funcional implementadas con sus pruebas.
- Todas las reglas de negocio validadas en backend y cubiertas por tests.
- CI/CD verde para lint, tests, cobertura y build.
- `docker compose up --build` levanta el sistema completo desde cero (db + backend + frontend).