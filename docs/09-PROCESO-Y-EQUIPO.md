# Proceso y Equipo — Clínica Angry

## 1. Equipo

| Rol del proyecto | Responsable | Responsabilidades |
| --- | --- | --- |
| Product Owner | Docente + representante usuario | Prioriza backlog, valida criterios y alcance |
| Scrum Master | Miembro del equipo | Facilita ceremonias, remueve impedimentos, protege la calidad |
| Dev Backend | 1–2 miembros | Django/DRF, modelos, API, reglas de negocio |
| Dev Frontend | 1–2 miembros | React/TS, componentes, guards, consumo de API |
| QA / Testing | 1 miembro (transversal) | Diseño de casos, pytest/Vitest/Playwright, cobertura |
| DevOps | 1 miembro (transversal) | Docker Compose, CI/CD, ambientes |

> En un contexto académico los miembros pueden rotar roles; **la calidad y las pruebas son responsabilidad de todo el equipo** (no solo del QA).

## 2. Proceso: Scrum adaptado

| Ceremonia | Frecuencia | Propósito |
| --- | --- | --- |
| Sprint Planning | Inicio de sprint | Seleccionar ítems del backlog que cumplan DoR, fijar meta del sprint |
| Daily (o stand-up) | Diario (máx. 15 min) | Qué hice, qué haré, qué me bloquea |
| Sprint Review | Fin de sprint | Demostrar HU terminadas contra criterios de aceptación |
| Retrospectiva | Fin de sprint | Mejorar proceso, testing y calidad |

## 3. Duración

- Sprints de **2 semanas**. Sprint 0 fue de planificación (ver [Planificación Sprint 0](./02-PLANIFICACION-SPRINT-0.md)).
- Horizonte: S1–S6 (ver [Backlog](./08-BACKLOG-DE-PRODUCTO.md)).

## 4. Definition of Ready (DoR)

Un ítem del backlog entra al sprint cuando:

- [ ] Descripción clara y criterios de aceptación verificables.
- [ ] Referencias HU/RF trazables.
- [ ] Estimación acordada (≤ 8 puntos o descompuesta).
- [ ] Sin dependencias técnicas bloqueantes sin resolver.
- [ ] Datos y reglas de negocio implicadas identificadas.

## 5. Definition of Done (DoD)

Una HU se considera **TERMINADA** solo si cumple TODOS los puntos:

- [ ] **Código funcionando**: la funcionalidad real (no mock) opera end-to-end (UI ↔ API ↔ BD).
- [ ] **Reglas en backend**: todo RBN aplicable validado en el backend (RBN-10).
- [ ] **Pruebas backend**: unitarias + integración relevantes escritas y pasando (pytest).
- [ ] **Pruebas frontend**: componentes/formularios/guards cubiertos (Vitest + RTL).
- [ ] **Criterios de aceptación**: cada C.A. de la HU verificado (manual o automatizado).
- [ ] **Regresión**: la suite completa del proyecto sigue verde.
- [ ] **Lint/typecheck**: ruff y eslint/tsc sin errores.
- [ ] **Cobertura**: no disminuye por debajo del objetivo en los módulos tocados (≥ 85 % backend / ≥ 80 % frontend en críticos).
- [ ] **Integración/CI**: la rama pasa el pipeline de GitHub Actions.
- [ ] **Datos demo**: seed actualizado si la HU introduce entidades.
- [ ] **Pull request**: revisado y mergeado sin aprobarse en rojo.

## 6. Reglas de calidad del equipo

1. **No mocks como producto**: la regla "sin mocks como sustituto del sistema real" es obligatoria. El mock API existe solo para pruebas unitarias de UI.
2. **Toda regla de negocio tiene test**: cada RBN-1 a RBN-10 tiene al menos un test del backend.
3. **No se declara terminado lo que no compila, no arranca o falla en tests** (norma del README).
4. **Técnicas de diseño de casos** en cada sprint: partición de equivalencia, valores límite, tablas de decisión y máquina de estados.
5. **Definición de crítico**: módulos de citas, disponibilidad, autenticación y permisos se consideran críticos para cobertura.

## 7. Estrategia de ramas

```
main  ──── merge solo con CI verde
  │
  ├── feature/<HU-ID>   (dev por ítem, PR a main)
  └── fix/<ticket>
```

- Toda rama integra: `ruff check`, `pytest`, `vitest`, lint y build.
- Los PR se revisan por al menos un integrante que no sea el autor.

## 8. Artefactos mantenidos

- Backlog priorizado (este repositorio, `skills/docs/08-BACKLOG-DE-PRODUCTO.md`).
- Tablero de sprint (GitHub Projects o similar).
- Registro de riesgos actualizado en la retrospectiva (`11-REGISTRO-DE-RIESGOS.md`).
- Registro de decisiones (ADR en `06-ARQUITECTURA.md`).