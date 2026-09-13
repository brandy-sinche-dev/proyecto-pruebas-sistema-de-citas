# Registro de Riesgos — Clínica Angry

Identificación y gestión de riesgos del proyecto. Escala: **Probabilidad** (Baja/Media/Alta) y **Impacto** (Bajo/Medio/Alto); **Exposición = P × I**.

| Escala | Bajo (1) | Medio (2) | Alto (3) |
| --- | --- | --- | --- |
| Probabilidad / Impacto | 1 | 2 | 3 |

## Riesgos identificados

| ID | Riesgo | P | I | Exposición | Mitigación |
| --- | --- | --- | --- | --- | --- |
| R01 | Reglas de negocio implementadas solo en UI (se burlan vía API) | Media | Alto | 6 | RBN-10 obligatorio; todas las reglas en backend + tests que las validan vía API |
| R02 | Mocks sustituyen al sistema real (quiebre de la regla del proyecto) | Media | Alto | 6 | DoD exige funcionalidad real end-to-end; mock solo en pruebas unitarias de UI |
| R03 | Bajas de cobertura de pruebas en módulos críticos | Media | Medio | 4 | Umbral en CI (≥ 85 % backend / ≥ 80 % frontend); reporte HTML por PR |
| R04 | Dobles reservas / conflictos de slot no detectados | Media | Alto | 6 | UniqueConstraint + validación en serializer + tests de integración con BD real |
| R05 | Falta de entornos (Docker) reproducibles en máquinas diferentes | Media | Medio | 4 | Compose con lockfiles (uv.lock, pnpm-lock.yaml); documentación de instalación |
| R06 | CI/CD inestable (tests flaky, tiempos de build) | Media | Medio | 4 | Pipeline por capas; seed de datos aislado; E2E opcional hasta estabilizar |
| R07 | Cambio de alcance (creep) por pedidos del PO/docente | Alta | Medio | 6 | Backlog aprobado, MoSCoW, cambios pasan por planning y ajuste de alcance |
| R08 | Curva de aprendizaje de las herramientas (uv, DRF, Vite, Playwright) | Alta | Bajo | 3 | Fallback pip/npm documentado, spikess cortos, pair programming |
| R09 | Datos demo inconsistentes que rompen tests E2E | Media | Medio | 4 | Seed idempotente y versionado con el dominio; tests E2E sobre data propia |
| R10 | Accesos entre roles (RBAC) con fugas de datos | Media | Alto | 6 | Permisos por ViewSet con tests de autorización (200/403) por cada endpoint crítico |
| R11 | Dependencias desactualizadas / vulnerabilidades | Baja | Medio | 2 | Dependencias fijadas con lockfiles; revisión periódica |
| R12 | Pérdida de datos en BD local (volumen) durante reset | Baja | Medio | 2 | Volumen `postgres_data` en Compose + seed reproducible |

## Gestión del riesgo

- El **Scrum Master** revisa el registro en cada retrospectiva.
- Todo riesgo con exposición ≥ 6 debe tener **dueño** y una tarea de mitigación en el sprint.
- Los riesgos de **rule engine** (R01, R04, R10) se convierten en tests concretos: cada RBN tiene su caso de prueba automatizado.
- Nuevos riesgos se agregan con su ID secuencial (R13, R14, …) y se actualiza este documento.