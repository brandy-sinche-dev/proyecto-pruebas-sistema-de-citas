# Backlog de Producto — Clínica Angry

Backlog priorizado (MoSCoW) y estimado (Fibonacci: 1, 2, 3, 5, 8, 13). Cada ítem referencia sus HU y RF. Horizonte: 6 sprints de desarrollo (S1–S6).

## 1. Convención de estimación

| Puntos | Significado |
| --- | --- |
| 1 | Tarea mínima (config, fix, UI simple) |
| 2 | HU pequeña con pruebas unitarias |
| 3 | HU media (UI + API + tests) |
| 5 | HU grande (flujo completo + integración) |
| 8 | Épica (requiere descomposición) |
| 13 | Incierta / requiere análisis previo (spike) |

## 2. Backlog priorizado

| # | Ítem | HU | RF | Prio | Puntos | Sprint |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Setup monorepo + Docker Compose (db/backend/frontend) | — | RNF-ARQ, RNF-OP | M | 8 | S1 |
| 2 | Config de calidad: ruff, eslint, vitest, pytest-cov | — | RNF-CAL, RNF-TST | M | 3 | S1 |
| 3 | Autenticación completa (register/login/refresh/logout + JWT) | HU-AUTH-001, HU-PAC-002 | RF-AUTH | M | 5 | S1 |
| 4 | Perfil de usuario + rol `PATIENT` | HU-PAC-003 | RF-USER | M | 3 | S1 |
| 5 | Modelo de dominio base (users, patients, doctors, specialties, schedules, appointments) | — | RF-SPEC, RF-DOC | M | 5 | S1 |
| 6 | Guard de rol en frontend (rutas + 403) | HU-AUTH-001 | RNF-SEG-006 | M | 3 | S1 |
| 7 | CRUD especialidades (admin) | HU-ADM-003 | RF-SPEC | M | 3 | S2 |
| 8 | CRUD médicos + asignación box (admin) | HU-ADM-002 | RF-DOC | M | 5 | S2 |
| 9 | Disponibilidad de médico (CRUD propia) | HU-DOC-002 | RF-SCH | M | 5 | S2 |
| 10 | Reserva de cita (valida RBN-1, RBN-2, RBN-3, RBN-4) | HU-PAC-006 | RF-APP | M | 8 | S2 |
| 11 | Ver especialidades/doctores y disponibilidad (paciente) | HU-PAC-004, HU-PAC-005 | RF-SPEC, RF-SCH | M | 3 | S3 |
| 12 | Agenda del médico (ver + confirmar/rechazar) | HU-DOC-003, HU-DOC-004 | RF-APP | M | 5 | S3 |
| 13 | Mis citas e historial (paciente) | HU-PAC-007 | RF-APP | M | 3 | S3 |
| 14 | Cancelación con ventana configurable | HU-PAC-008, HU-REC-004 | RF-APP-009 | M | 5 | S3 |
| 15 | Notificaciones internas | HU-PAC-009 | RF-NOT | S | 3 | S3 |
| 16 | Signación de estados: check-in y atención (recepción/médico) | HU-REC-002, HU-DOC-005 | RF-APP-011/012, RBN-9 | M | 5 | S3 |
| 17 | Dashboard paciente (próximas citas) | — | RF-DASH | M | 2 | S3 |
| 18 | Dashboard médico y recepción (citas del día) | HU-REC-001 | RF-DASH | M | 3 | S4 |
| 19 | Dashboard admin (KPIs, `dashboard/summary/`) | HU-ADM-001 | RF-DASH | S | 3 | S4 |
| 20 | Atención clínica: notas de consulta | HU-DOC-006 | RF-CLI-001 | S | 5 | S4 |
| 21 | Recetas con medicamentos | HU-DOC-006 | RF-CLI-002 | S | 5 | S4 |
| 22 | Exámenes clínicos | HU-DOC-006 | RF-CLI-003 | C | 5 | S5 |
| 23 | Gestión de consultorios (boxes) | HU-ADM-004 | RF-BOX | S | 3 | S4 |
| 24 | Gestión de citas global (admin) | HU-ADM-006 | RF-APP | S | 5 | S4 |
| 25 | Facturación: liquidaciones y medios de pago | — | RF-FIN-001/002/003 | S | 5 | S5 |
| 26 | Aseguradoras (admin) | — | RF-FIN-004/005 | C | 3 | S5 |
| 27 | Auditoría + vista admin | HU-ADM-007 | RF-AUD | S | 3 | S5 |
| 28 | Teleconsulta (bool + enlace) | HU-PAC-006 | RF-APP-007 | C | 3 | S5 |
| 29 | Recuperación de contraseña (UI base) | HU-AUTH-002 | RF-AUTH-007 | S | 2 | S5 |
| 30 | Gestión de horarios global (admin) | HU-ADM-005 | RF-SCH-006 | S | 3 | S6 |
| 31 | Suite E2E Playwright (5 flujos) | — | RNF-TST-005 | S | 5 | S6 |
| 32 | Ajustes finales: cobertura ≥ objetivo, CI verde, Docs | — | RNF-TST, RNF-OP | M | 5 | S6 |

**Total estimado ≈ 122 puntos** (ajustable).

## 3. Hoja de ruta por sprint

| Sprint | Meta | Capacidad estimada |
| --- | --- | --- |
| S1 | Base técnica + autenticación + dominio base | ~18 |
| S2 | Catálogos, disponibilidad y reserva con reglas | ~21 |
| S3 | Flujos paciente/médico: agenda, historial, cancelación, check-in | ~21 |
| S4 | Dashboards, atención clínica, boxes, gestión admin de citas | ~19 |
| S5 | Facturación, auditoría, exámenes, teleconsulta, recuperación | ~21 |
| S6 | Horarios globales, E2E, pulido y CI completo | ~22 |

## 4. Trazabilidad

Cada ítem debe poder rastrearse a su HU (criterios de aceptación) y a sus RF. Si un ítem no tiene HU/RF, se marca como técnico (deuda/tarea) y se acuerda en planning.

## 5. Política de entrada al sprint (Definition of Ready)

- [ ] Criterios de aceptación verificables.
- [ ] Dependencias identificadas y sin bloqueos técnicos sin resolver.
- [ ] Estimación acordada (≤ 8 puntos o descompuesto).
- [ ] Asignado a un sprint con responsables.