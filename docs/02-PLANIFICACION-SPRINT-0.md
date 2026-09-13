# Planificación Sprint 0

## 1. Objetivo del Sprint 0

Preparar la **base de planificación y técnica** del proyecto para que el primer sprint de funcionalidad arranque con una comprensión compartida del dominio, arquitectura y estrategia de pruebas. El Sprint 0 **no entrega funcionalidad**, entrega decisiones y documentación accionable.

## 2. Duración y equipo

| Campo | Valor |
| --- | --- |
| Duración | 2 semanas (referencia: lun 14 sep – vie 25 sep 2026) |
| Ceremonia de cierre | Revisión del paquete de planificación y definición de la meta del Sprint 1 |
| Equipo | Product Owner (voz docente/usuario), Scrum Master, 4–5 desarrolladores con énfasis (backend, frontend, testing, DevOps/CI) |

## 3. Actividades planificadas

| # | Actividad | Responsable | Entregable |
| --- | --- | --- | --- |
| 1 | Análisis del contexto y actores | PO + equipo | Visión y alcance |
| 2 | Elicitación de requisitos (entrevistas, revisión de procesos actuales) | Equipo | Lista de RF / RNF |
| 3 | Modelado de reglas de negocio (máquina de estados, tablas de decisión) | Backend + testing | Reglas formales y casos base |
| 4 | Definición de HU y criterios de aceptación | Equipo | HU priorizadas (MoSCoW) |
| 5 | Definición de arquitectura y stack | Arquitectura | Documento de arquitectura y ADR |
| 6 | Modelo de datos (ER) y enums | Backend | Modelo de datos |
| 7 | Identificación de riesgos y plan de mitigación | Scrum Master | Registro de riesgos |
| 8 | Definición del proceso (DoR / DoD) y config de CI base | Scrum Master + DevOps | Proceso, DoD, pipeline inicial |
| 9 | Estimación y armado del backlog priorizado | Equipo + PO | Backlog de producto |
| 10 | Revisión y aprobación del paquete | PO + docente | Paquete de planificación aprobado |

## 4. Cronograma

| Día | Hito |
| --- | --- |
| L1 | Kickoff: contexto, stakeholders, visión |
| L2–L3 | Elicitación de requisitos (RF/RNF) y reglas de negocio |
| L4–L5 | HU y criterios de aceptación |
| L6–L7 | Arquitectura, ADR y modelo de datos |
| L8 | Riesgos, proceso, DoR/DoD |
| L9 | Estimación y backlog; setup inicial de repositorio y CI base |
| L10 | Revisión final, aprobación y definición de meta del Sprint 1 |

## 5. Entregables del Sprint 0

1. Visión y alcance.
2. Requisitos funcionales codificados.
3. Requisitos no funcionales codificados.
4. Historias de usuario con criterios de aceptación.
5. Documento de arquitectura con ADR.
6. Modelo de datos (ER + enums).
7. Backlog de producto priorizado y estimado.
8. Proceso de equipo: Definition of Ready y Definition of Done.
9. Registro de riesgos.
10. Glosario del dominio.

## 6. Definición de "Listo" del Sprint 0 (DoD del Sprint 0)

El Sprint 0 se considera terminado cuando:

- [ ] Existe visión y alcance aprobado por el PO.
- [ ] Todos los RF y RNF están codificados, trazables y priorizados.
- [ ] Cada HU del backlog tiene criterios de aceptación verificables.
- [ ] La arquitectura y el modelo de datos reflejan el sistema real (sin mocks como sustituto).
- [ ] El backlog está estimado y priorizado (MoSCoW) y cabe en el horizonte de 6 sprints.
- [ ] Riesgos identificados con mitigación propietaria.
- [ ] El repositorio tiene CI base que ejecuta al menos lint y tests del backend/frontend.
- [ ] `docker compose up --build` levanta el sistema de referencia (db + backend + frontend).

## 7. Fuera del alcance del Sprint 0

- Implementación de funcionalidades (Sprint 1 en adelante).
- Definición exhaustiva de todos los casos de prueba detallados (se definen por sprint con cada HU).