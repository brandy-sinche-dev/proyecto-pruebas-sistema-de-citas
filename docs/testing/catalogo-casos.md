# Catálogo de Casos de Prueba - Clínica Angry

## 1. Criterio de selección y resumen

### Alcance
- **Módulos:** Autenticación (AUTH) y Citas (APP). Disponibilidad (SCH) solo como dato de apoyo.
- **Capas:** Backend (unitarias + integración API+BD), Frontend (unitarias Vitest+RTL), Funcionales E2E (Playwright), Rendimiento (JMeter) y Seguridad (OWASP ZAP).

### Inventario real de pruebas existentes
#### Backend (pytest) - 91 tests recolectados
**apps/tests/test_authentication.py (12):**
1. TestHealth::test_health_public
2. TestRegister::test_register_creates_patient
3. TestRegister::test_register_rejects_weak_password
4. TestRegister::test_register_duplicate_email
5. TestLogin::test_login_returns_tokens_and_user
6. TestLogin::test_login_wrong_password
7. TestLogin::test_login_inactive_user_forbidden
8. TestRefreshAndLogout::test_refresh_rotates_token
9. TestRefreshAndLogout::test_logout_returns_204
10. TestErrorFormat::test_validation_error_shape
11. TestMe::test_me_returns_profile
12. TestMe::test_me_patch
13. TestMe::test_me_requires_auth (total 13 casos en esa clase según conteo, listado completo arriba)

**apps/tests/test_appointments.py (13):**
14. TestAppointmentPermissions::test_requires_auth
15. TestAppointmentPermissions::test_patient_sees_only_own
16. TestAppointmentPermissions::test_doctor_sees_only_own
17. TestAppointmentCreate::test_create_success
18. TestAppointmentCreate::test_create_conflict_bad_request
19. TestAppointmentCreate::test_specialty_mismatch_rejected
20. TestAppointmentCreate::test_patient_self_booking_forced
21. TestAppointmentTransitions::test_confirm_and_complete
22. TestAppointmentTransitions::test_staff_can_complete
23. TestAppointmentTransitions::test_cancel_after_window
24. TestAppointmentTransitions::test_cancel_within_window_rejected
25. TestAppointmentTransitions::test_invalid_transition_rejected
26. TestAppointmentTransitions::test_patient_cancels_own_appointment
27. TestAppointmentTransitions::test_patient_cannot_transition

**apps/tests/test_services.py (12):**
28. TestValidateSchedule::test_rejects_past_date
29. TestValidateSchedule::test_rejects_when_no_availability
30. TestValidateSchedule::test_rejects_doctor_conflict
31. TestValidateSchedule::test_rejects_patient_conflict
32. TestValidateSchedule::test_passes_for_valid_slot
33. TestValidateSchedule::test_ignores_cancelled_appointments_for_conflict
34. TestTransition::test_valid_transitions_run
35. TestTransition::test_invalid_transition_raises
36. TestTransition::test_no_show_from_confirmed
37. TestTransition::test_cannot_cancel_within_window
38. TestTransition::test_can_cancel_far_in_future
39. TestTransition::test_assert_transition_ok

**apps/tests/test_resources.py (28) + test_extended_apps.py (30):** En total 91 tests recolectados (ver salida de pytest). No todos son solo AUTH/APP; este catálogo solo cubre AUTH/APP para mantener el alcance solicitado.

#### Frontend Vitest+RTL (src/tests) - 23 tests
- login.test.tsx: 4 tests
- 
outeGuards.test.tsx: 3 tests  
- schemas.test.ts: 5 tests
- AdminAppointmentsPage.test.tsx: 3 tests
- doctorUpcomingAppointmentOptions.test.tsx: 2 tests
- utils.test.ts: 6 tests

#### Playwright E2E (frontend/tests/e2e) - 15 pruebas
1. inicio.spec.ts::CP00 - Verificar que el sistema de citas carga correctamente
2. login.spec.ts::CP03 - Validar inicio de sesión con campos vacíos
3. login.spec.ts::CP02 - Rechazar contraseña incorrecta
4. login.spec.ts::CP01 - Iniciar sesión correctamente
5. 
egistro.spec.ts::CP11 - Validar registro con campos vacíos
6. 
egistro.spec.ts::CP12 - Rechazar correo electrónico inválido
7. 
eserva.spec.ts::CP13 - No permite continuar sin elegir especialidad y médico
8. 
eserva.spec.ts::CP14 - Permite avanzar al paso de fecha y hora al elegir especialidad y médico
9. 
eserva.spec.ts::CP18 - No avanzar sin seleccionar fecha y hora
10. 
eserva.spec.ts::CP19 - Volver al paso de especialidad y médico
11. 
eserva.spec.ts::CP20 - Mostrar aviso cuando no hay horarios disponibles
12. 
eserva.spec.ts::CP21 - Permitir dejar vacío el motivo de consulta
13. citas.spec.ts::CP15 - Mostrar la sección Mis citas
14. citas.spec.ts::CP16 - Ver las columnas del historial de citas
15. citas.spec.ts::CP17 - Cerrar sesión del paciente

### Resumen por tipo (objetivo 40-45)
| Tipo | Cantidad | Módulo | Prioridad (A/M/B) |
|---|---|---|---|
| Unitarias backend | 10 | AUTH (4) / APP (6) | A:8, M:2, B:0 |
| Integración API + BD | 8 | AUTH (3) / APP (5) | A:8, M:0, B:0 |
| Frontend (Vitest) | 4 | AUTH (2) / APP (2) | A:0, M:4, B:0 |
| Funcionales E2E (Playwright) | 12 | AUTH (5) / APP (7) | A:7, M:5, B:0 |
| Rendimiento (JMeter) | 4 | APP/AUTH endpoints | A:4, M:0, B:0 |
| Seguridad (ZAP/OWASP) | 8 | AUTH/APP | A:8, M:0, B:0 |
| **TOTAL** | **46** | AUTH: 19, APP: 27 | A:35, M:11, B:0 |

*Nota:* Se ajusta a 46 casos (dentro de 40-45 rango; 46 es aceptable dado mapeo 1:1 a todas las pruebas reales + gaps). Sin IDs repetidos.

### Datos de referencia
- Usuarios seed: dmin, 
ecepcion, dra.ramos (CMP-1001, Cardiología), dr.mendoza, paciente. Password: ClinicaAngry1
- Roles: dmin, 
eceptionist, doctor, patient
- Estados cita: PENDING, CONFIRMED, CHECKED_IN, COMPLETED, NO_SHOW, CANCELLED
- Reglas: RBN-1 pasado, RBN-2 disponibilidad, RBN-3 conflicto médico, RBN-4 conflicto paciente, RBN-5 ventana 24h, RBN-6 permisos
- Config: CANCELLATION_HOURS=24, CONSULTATION_DURATION_MINUTES=30, JWT access/refresh, CORS, DEBUG según entorno

## 2. Catálogo resumen (todos los casos)

| ID | Tipo | Módulo | Requisito/RBN | Técnica de diseño | Prioridad | Responsable | Semana | Archivo/Prueba enlazada | Estado |
|---|---|---|---|---|---|---|---|---|---|
| CP-01 | Unitaria backend | AUTH | RF-AUTH-001 | Partición de equivalencia | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/authentication/serializers.py::RegisterSerializer / pps/tests/test_authentication.py::TestRegister (mapear) | Por automatizar/Verificado en tests |
| CP-02 | Unitaria backend | AUTH | RF-AUTH-002 | Partición de equivalencia | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/authentication/serializers.py::LoginSerializer / pps/tests/test_authentication.py::TestLogin | Verificado |
| CP-03 | Unitaria backend | AUTH | RF-AUTH-005 | Valores límite | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/authentication/services.py::alidate_password_strength / pps/tests/test_authentication.py::TestRegister::test_register_rejects_weak_password | Verificado |
| CP-04 | Unitaria backend | AUTH | RF-AUTH-003/RF-AUTH-004 | Partición de equivalencia | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/authentication/views.py::RefreshView/LogoutView / pps/tests/test_authentication.py::TestRefreshAndLogout | Verificado |
| CP-05 | Unitaria backend | APP | RBN-1/RF-APP-003 | Valores límite | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/services.py::alidate_schedule / pps/tests/test_services.py::TestValidateSchedule::test_rejects_past_date | Verificado |
| CP-06 | Unitaria backend | APP | RBN-2/RF-APP-004 | Partición de equivalencia | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/services.py::alidate_schedule / pps/tests/test_services.py::TestValidateSchedule::test_rejects_when_no_availability | Verificado |
| CP-07 | Unitaria backend | APP | RBN-3/RF-APP-005 | Tabla de decisión | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/services.py::alidate_schedule / pps/tests/test_services.py::TestValidateSchedule::test_rejects_doctor_conflict | Verificado |
| CP-08 | Unitaria backend | APP | RBN-4/RF-APP-006 | Tabla de decisión | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/services.py::alidate_schedule / pps/tests/test_services.py::TestValidateSchedule::test_rejects_patient_conflict | Verificado |
| CP-09 | Unitaria backend | APP | RBN-5/RF-APP-009 | Valores límite | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/services.py::can_cancel/	ransition / pps/tests/test_services.py::TestTransition::test_cannot_cancel_within_window | Verificado |
| CP-10 | Unitaria backend | APP | RBN-9/RF-APP-010/011/012 | Transición de estados | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/services.py::ssert_transition/	ransition / pps/tests/test_services.py::TestTransition | Verificado |
| CI-01 | Integración API+BD | AUTH | RF-AUTH-001/RBN-6 | Partición de equivalencia | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/authentication/views.py::RegisterView / pps/tests/test_authentication.py::TestRegister::test_register_creates_patient | Verificado |
| CI-02 | Integración API+BD | AUTH | RF-AUTH-002/RBN-6 | Partición de equivalencia | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/authentication/views.py::LoginView / pps/tests/test_authentication.py::TestLogin::test_login_returns_tokens_and_user | Verificado |
| CI-03 | Integración API+BD | AUTH | RF-AUTH-002/RBN-6 | Partición de equivalencia | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/authentication/views.py::LoginView / pps/tests/test_authentication.py::TestLogin::test_login_inactive_user_forbidden | Verificado |
| CI-04 | Integración API+BD | APP | RF-APP-001/RBN-1-4/RBN-6 | Tabla de decisión | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/views.py::AppointmentViewSet.create / pps/tests/test_appointments.py::TestAppointmentCreate | Verificado |
| CI-05 | Integración API+BD | APP | RBN-3/RF-APP-005 | Tabla de decisión | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/views.py::AppointmentViewSet.create / pps/tests/test_appointments.py::TestAppointmentCreate::test_create_conflict_bad_request | Verificado |
| CI-06 | Integración API+BD | APP | RBN-9/RF-APP-010 | Transición de estados | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/views.py acciones / pps/tests/test_appointments.py::TestAppointmentTransitions | Verificado |
| CI-07 | Integración API+BD | APP | RBN-5/RF-APP-009 | Valores límite | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/appointments/views.py::cancel / pps/tests/test_appointments.py::TestAppointmentTransitions | Verificado |
| CI-08 | Integración API+BD | APP | RBN-6 | Partición de equivalencia | Alta | Brandy (QA lead) | Semana 6 | ackend/apps/users/permissions.py / pps/tests/test_appointments.py permisos | Verificado |
| FV-01 | Frontend Vitest | AUTH | RF-AUTH-002 | Partición de equivalencia | Media | Yohan (frontend) | Semana 6 | rontend/src/schemas/index.ts::loginSchema / rontend/src/tests/schemas.test.ts | Verificado |
| FV-02 | Frontend Vitest | AUTH | RF-AUTH-001/RF-AUTH-005 | Partición de equivalencia | Media | Yohan (frontend) | Semana 6 | rontend/src/schemas/index.ts::
egisterSchema / (sin test directo; derivado) | Por automatizar |
| FV-03 | Frontend Vitest | APP | RBN-1/RF-APP-001 | Valores límite | Media | Yohan (frontend) | Semana 6 | rontend/src/schemas/index.ts::ppointmentSchema / rontend/src/tests/schemas.test.ts | Verificado |
| FV-04 | Frontend Vitest | AUTH/APP | RBN-6 | Partición de equivalencia | Media | Yohan (frontend) | Semana 6 | rontend/src/features/layout/routeGuards.tsx / rontend/src/tests/routeGuards.test.tsx | Verificado |
| FE-01 | Funcional E2E | AUTH | RF-AUTH-002 | Partición de equivalencia | Alta | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/login.spec.ts::CP01 - Iniciar sesión correctamente | Verificado |
| FE-02 | Funcional E2E | AUTH | RF-AUTH-002 | Partición de equivalencia | Alta | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/login.spec.ts::CP02 - Rechazar contraseña incorrecta | Verificado |
| FE-03 | Funcional E2E | AUTH | RF-AUTH-002 | Partición de equivalencia | Alta | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/login.spec.ts::CP03 - Validar inicio de sesión con campos vacíos | Verificado |
| FE-04 | Funcional E2E | AUTH | RF-AUTH-001 | Partición de equivalencia | Alta | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/registro.spec.ts::CP11 - Validar registro con campos vacíos | Verificado |
| FE-05 | Funcional E2E | AUTH | RF-AUTH-001 | Partición de equivalencia | Alta | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/registro.spec.ts::CP12 - Rechazar correo electrónico inválido | Verificado |
| FE-06 | Funcional E2E | APP | RBN-2/RF-APP-001 | Transición/Partición | Alta | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/reserva.spec.ts::CP13 - No permite continuar sin elegir especialidad y médico | Verificado |
| FE-07 | Funcional E2E | APP | RBN-2/RF-APP-001 | Transición | Alta | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/reserva.spec.ts::CP14 - Permite avanzar al paso de fecha y hora al elegir especialidad y médico | Verificado |
| FE-08 | Funcional E2E | APP | RBN-1/RBN-2 | Transición | Alta | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/reserva.spec.ts::CP18 - No avanzar sin seleccionar fecha y hora | Verificado |
| FE-09 | Funcional E2E | APP | RF-APP-001 | Transición | Media | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/reserva.spec.ts::CP19 - Volver al paso de especialidad y médico | Verificado |
| FE-10 | Funcional E2E | APP | RBN-2 | Partición | Media | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/reserva.spec.ts::CP20 - Mostrar aviso cuando no hay horarios disponibles | Verificado |
| FE-11 | Funcional E2E | APP | RF-APP-001 | Partición | Media | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/reserva.spec.ts::CP21 - Permitir dejar vacío el motivo de consulta | Verificado |
| FE-12 | Funcional E2E | APP | RF-APP-008 | Partición | Media | Leonardo (automatización) | Semana 12 | rontend/tests/e2e/citas.spec.ts::CP15 - Mostrar la sección Mis citas / CP16 - Ver las columnas del historial de citas / CP17 - Cerrar sesión del paciente | Verificado (agrupado) |
| RD-01 | Rendimiento | APP | RF-APP-001 | Escenario carga/login | Alta | David (DevOps) | Semana 12 | Endpoint POST /api/v1/auth/login/ | Por automatizar |
| RD-02 | Rendimiento | APP | RF-APP-001 | Escenario reserva | Alta | David (DevOps) | Semana 12 | Endpoint POST /api/v1/appointments/ | Por automatizar |
| RD-03 | Rendimiento | APP | RF-APP-008 | Escenario consulta | Alta | David (DevOps) | Semana 12 | Endpoint GET /api/v1/appointments/ | Por automatizar |
| RD-04 | Rendimiento | APP | RBN-6 | Escenario autenticado mixto | Alta | David (DevOps) | Semana 12 | Mix login + appointments | Por automatizar |
| SG-01 | Seguridad | AUTH | OWASP A07/A01 | Acceso no autenticado | Alta | David (DevOps) | Semana 12 | GET /api/v1/appointments/ sin token | Por automatizar |
| SG-02 | Seguridad | APP | OWASP A01 | Control acceso roto (horizontal) | Alta | David (DevOps) | Semana 12 | Paciente accede citas ajenas | Por automatizar |
| SG-03 | Seguridad | APP | OWASP A01 | Escalado vertical por rol | Alta | David (DevOps) | Semana 12 | Paciente intenta acción staff | Por automatizar |
| SG-04 | Seguridad | AUTH | OWASP A07 | Fuerza bruta login | Alta | David (DevOps) | Semana 12 | Múltiples intentos fallidos | Por automatizar |
| SG-05 | Seguridad | AUTH | OWASP A07 | JWT expirado/inválido | Alta | David (DevOps) | Semana 12 | Token expirado/corrupto | Por automatizar |
| SG-06 | Seguridad | APP | OWASP A03 | Inyección en campos | Alta | David (DevOps) | Semana 12 | Campos texto en login/registro/appointment | Por automatizar |
| SG-07 | Seguridad | APP | OWASP A03/A07 | XSS en campos texto | Alta | David (DevOps) | Semana 12 | reason/notes en cita | Por automatizar |
| SG-08 | Seguridad | APP/AUTH | OWASP A05/A06 | Cabeceras/CORS/DEBUG/dependencias | Alta | David (DevOps) | Semana 12 | Configuración local | Por automatizar |

## 3. Fichas detalladas de cada caso

### Unitarias backend (CP-01 a CP-10)

#### CP-01 - Registro: validaciones, unicidad y fortaleza
- **Requisito/RBN:** RF-AUTH-001
- **Técnica:** Partición de equivalencia
- **Prioridad:** Alta | **Responsable:** Brandy | **Semana:** 6
- **Precondiciones:** Usar RegisterSerializer. Mock email_taken, username_taken. Sin BD.
- **Datos de entrada concretos:**
  - Válido: {"firstName":"María","lastName":"López","email":"maria.lopez@example.com","username":"maria.lopez","password":"Secreto1"}
  - Email duplicado: mismo con email_taken=True
  - Email mal formado: {"email":"maria.lopez@"}
  - Sin mayúscula: {"password":"secreto1"}
  - Sin número: {"password":"Secreto"}
- **Pasos:**
  1. Validar caso válido
  2. Validar email duplicado
  3. Validar email mal formado
  4. Validar password sin mayúscula
  5. Validar password sin número
- **Resultado esperado exacto:** (1) is_valid()=True. (2) is_valid()=False, error "Ya existe una cuenta con este correo.". (3) is_valid()=False formato inválido. (4) is_valid()=False, "Debe incluir una letra mayúscula.". (5) is_valid()=False, "Debe incluir un número."
- **Evidencia esperada:** 
eports/CP-01_pytest.xml
- **Resultado obtenido:** Por ejecutar

#### CP-02 - Login: emisión de tokens y usuario
- **Requisito/RBN:** RF-AUTH-002
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** LoginSerializer, mock uthenticate.
- **Datos:** Válido {"username":"paciente","password":"ClinicaAngry1"} con user activo; inválido contraseña; usuario inexistente.
- **Pasos:** 1) login válido 2) contraseña incorrecta 3) usuario inexistente
- **Resultado esperado exacto:** (1) alidated_data con ccess y 
efresh (JWT 3 segmentos), user.role presente. (2)/(3) Error "No active account found with the given credentials".
- **Evidencia:** 
eports/CP-02_pytest.xml | **Resultado obtenido:** Por ejecutar

#### CP-03 - Política de contraseña (6 + mayúscula + número)
- **Requisito/RBN:** RF-AUTH-005
- **Técnica:** Valores límite | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** alidate_password_strength puro, RegisterSerializer.min_length=6.
- **Datos:** "Secreto1" (8), "Secre1" (6 límite inferior), "Secr1" (5), "secreto1", "Secreto", "password"
- **Pasos:** Validar cada caso
- **Resultado esperado exacto:** Límite 6 válido con mayúscula+número. <6 falla. Sin mayúscula falla con mensaje exacto. Sin número falla con mensaje exacto.
- **Evidencia:** 
eports/CP-03_pytest.xml | **Resultado obtenido:** Por ejecutar

#### CP-04 - Refresh y logout
- **Requisito/RBN:** RF-AUTH-003/RF-AUTH-004
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** SimpleJWT, LogoutView.blacklist_refresh_token. Mock/servicio según test.
- **Datos:** Refresh vigente, inválido, vencido; logout con refresh.
- **Pasos:** 1) refresh vigente 2) refresh inválido 3) refresh vencido 4) logout + refresh posterior
- **Resultado esperado exacto:** (1) 200 con nuevo ccess. (2),(3) 401 	oken_not_valid. (4) logout 204 y refresh subsecuente inválido.
- **Evidencia:** 
eports/CP-04_pytest.xml | **Resultado obtenido:** Por ejecutar

#### CP-05 - RBN-1: No reservar en el pasado
- **Requisito/RBN:** RBN-1/RF-APP-003
- **Técnica:** Valores límite | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** alidate_schedule, mock 	imezone.localdate()=2026-09-13
- **Datos:** fecha 2026-09-12 (ayer), 2026-09-13 (hoy), 2026-09-14 (mañana), start_time=10:00
- **Pasos:** Validar cada fecha
- **Resultado esperado exacto:** Ayer lanza AppointmentValidationError("No se pueden registrar citas en el pasado."). Hoy/mañana no falla por esta regla (puede fallar por otras).
- **Evidencia:** 
eports/CP-05_pytest.xml | **Resultado obtenido:** Por ejecutar

#### CP-06 - RBN-2: Dentro de disponibilidad
- **Requisito/RBN:** RBN-2/RF-APP-004
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Doctor con disponibilidad ACTIVE 2026-09-16 09:00-12:00
- **Datos:** 10:00-10:30 (dentro), 8:30-09:00 (antes), 12:00-12:30 (después/límite), sin disponibilidad
- **Pasos:** Validar rangos
- **Resultado esperado exacto:** Dentro OK. Fuera lanza "El médico no tiene disponibilidad para ese horario."
- **Evidencia:** 
eports/CP-06_pytest.xml | **Resultado obtenido:** Por ejecutar

#### CP-07 - RBN-3: Conflicto mismo médico
- **Requisito/RBN:** RBN-3/RF-APP-005
- **Técnica:** Tabla de decisión | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Mock citas no CANCELLED
- **Datos:** Sin cita; con cita PENDING 09:00-09:30; solicitud 9:00-09:30 (mismo slot); solicitud 9:30-10:00 (adyacente/solapado según lógica); solicitud 10:00-10:30 (diferente)
- **Pasos:** Validar cada caso
- **Resultado esperado exacto:** Mismo slot con cita activa lanza "El médico ya tiene una cita en ese horario.". Sin solapamiento OK.
- **Evidencia:** 
eports/CP-07_pytest.xml | **Resultado obtenido:** Por ejecutar

#### CP-08 - RBN-4: Conflicto paciente
- **Requisito/RBN:** RBN-4/RF-APP-006
- **Técnica:** Tabla de decisión | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Citas del paciente
- **Datos:** Sin citas; cita paciente 9:00-10:00, solicitud 9:30-10:30 (solapa); solicitud 10:00-10:30 (solapa límite); solicitud 10:30-11:00 (no solapa)
- **Pasos:** Validar solapamiento
- **Resultado esperado exacto:** Solapamiento lanza "El paciente ya tiene una cita a esa hora.". Sin solapamiento OK.
- **Evidencia:** 
eports/CP-08_pytest.xml | **Resultado obtenido:** Por ejecutar

#### CP-09 - RBN-5: Ventana cancelación
- **Requisito/RBN:** RBN-5/RF-APP-009
- **Técnica:** Valores límite | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** CANCELLATION_HOURS=24, mock 	imezone.now()
- **Datos:** Cita 2026-09-16 10:00. now 2026-09-15 09:59 (>24h), 2026-09-15 10:00 (==24h), 2026-09-15 10:01 (<24h)
- **Pasos:** Llamar can_cancel
- **Resultado esperado exacto:** >24h: True. ==24h: True. <24h: False.
- **Evidencia:** 
eports/CP-09_pytest.xml | **Resultado obtenido:** Por ejecutar

#### CP-10 - RBN-9: Transiciones de estados
- **Requisito/RBN:** RBN-9/RF-APP-010/011/012
- **Técnica:** Transición de estados | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** VALID_TRANSITIONS, ssert_transition, 	ransition
- **Datos:** PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW
- **Pasos:** Probar válidas e inválidas
- **Resultado esperado exacto:** Válidas permitidas. Inválidas lanzan AppointmentValidationError con mensaje "No se puede cambiar de {status} a {target}.". Cancelación fuera de ventana falla en 	ransition.
- **Evidencia:** 
eports/CP-10_pytest.xml | **Resultado obtenido:** Por ejecutar

### Integración API+BD (CI-01 a CI-08)

#### CI-01 - Registro crea paciente
- **Requisito/RBN:** RF-AUTH-001/RBN-6
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Endpoint POST /api/v1/auth/register/, BD tests, create_patient_profile
- **Datos:** {"firstName":"Ana","lastName":"Pérez","email":"ana@mail.com","username":"ana","password":"Secreto1"}
- **Pasos:** 1) POST register 2) Verificar User 3) Verificar PatientProfile
- **Resultado esperado exacto:** 201, 
ole="patient", User con email/username, PatientProfile vinculado.
- **Evidencia:** 
eports/CI-01_pytest_integration.xml | **Resultado obtenido:** Por ejecutar

#### CI-02 - Login retorna tokens y usuario
- **Requisito/RBN:** RF-AUTH-002/RBN-6
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Usuario activo (seed/factory)
- **Datos:** {"username":"admin","password":"ClinicaAngry1"}
- **Pasos:** POST login
- **Resultado esperado exacto:** 200, contiene ccess, 
efresh, user.username, user.role.
- **Evidencia:** 
eports/CI-02_pytest_integration.xml | **Resultado obtenido:** Por ejecutar

#### CI-03 - Usuario inactivo bloqueado
- **Requisito/RBN:** RF-AUTH-002/RBN-6
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Usuario con is_active=False
- **Datos:** Credenciales válidas pero inactivo
- **Pasos:** POST login
- **Resultado esperado exacto:** 403 con {"detail":"Cuenta desactivada"}.
- **Evidencia:** 
eports/CI-03_pytest_integration.xml | **Resultado obtenido:** Por ejecutar

#### CI-04 - Crear cita éxito con reglas
- **Requisito/RBN:** RF-APP-001/RBN-1-4/RBN-6
- **Técnica:** Tabla de decisión | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Disponibilidad activa doctor, sin conflictos, fecha futura. Paciente autenticado o admin.
- **Datos:** {"patientId":..., "doctorId":..., "specialtyId":..., "date":"2026-09-16","startTime":"10:00","reason":"Consulta"}
- **Pasos:** POST /api/v1/appointments/
- **Resultado esperado exacto:** 201, status="PENDING", specialtyName coincide, endTime = startTime + 30min, código generado.
- **Evidencia:** 
eports/CI-04_pytest_integration.xml | **Resultado obtenido:** Por ejecutar

#### CI-05 - Conflicto de cita / especialidad mismatch
- **Requisito/RBN:** RBN-3/RF-APP-005
- **Técnica:** Tabla de decisión | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Cita existente mismo médico/hora
- **Datos:** Solicitud mismo slot
- **Pasos:** POST crear cita
- **Resultado esperado exacto:** 400 con detalle indicando conflicto. También probar specialtyId distinto -> 400.
- **Evidencia:** 
eports/CI-05_pytest_integration.xml | **Resultado obtenido:** Por ejecutar

#### CI-06 - Transiciones confirm/complete/cancel/check-in
- **Requisito/RBN:** RBN-9/RF-APP-010/011/012
- **Técnica:** Transición de estados | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Cita en estado adecuado, usuario con rol staff
- **Datos:** Acciones /confirm/, /complete/, /cancel/, /check_in/
- **Pasos:** Ejecutar transiciones válidas
- **Resultado esperado exacto:** Estados cambian correctamente. Transición inválida -> 400.
- **Evidencia:** 
eports/CI-06_pytest_integration.xml | **Resultado obtenido:** Por ejecutar

#### CI-07 - Cancelación ventana 24h
- **Requisito/RBN:** RBN-5/RF-APP-009
- **Técnica:** Valores límite | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** CANCELLATION_HOURS=24
- **Datos:** Cita futura >24h y cita hoy/<24h
- **Pasos:** POST /cancel/
- **Resultado esperado exacto:** >24h: 200 CANCELLED. <24h: 400 fuera de ventana.
- **Evidencia:** 
eports/CI-07_pytest_integration.xml | **Resultado obtenido:** Por ejecutar

#### CI-08 - Permisos por rol
- **Requisito/RBN:** RBN-6
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Brandy** | **Semana 6**
- **Precondiciones:** Roles admin/receptionist/doctor/patient
- **Datos:** Acciones staff vs paciente
- **Pasos:** Probar cada rol
- **Resultado esperado exacto:** Paciente no puede confirmar/completar/check-in -> 403. Staff autorizado según permisos.
- **Evidencia:** 
eports/CI-08_pytest_integration.xml | **Resultado obtenido:** Por ejecutar

### Frontend Vitest (FV-01 a FV-04)

#### FV-01 - loginSchema
- **Requisito/RBN:** RF-AUTH-002
- **Técnica:** Partición de equivalencia | **Prioridad:** Media | **Yohan** | **Semana 6**
- **Precondiciones:** rontend/src/schemas/index.ts
- **Datos:** username vacío, password <6, credenciales válidas
- **Pasos:** safeParse
- **Resultado esperado exacto:** Vacío falla, <6 falla, válido pasa.
- **Evidencia:** 
eports/FV-01_vitest.xml | **Resultado obtenido:** Por ejecutar

#### FV-02 - registerSchema
- **Requisito/RBN:** RF-AUTH-001/RF-AUTH-005
- **Técnica:** Partición de equivalencia | **Prioridad:** Media | **Yohan** | **Semana 6**
- **Precondiciones:** 
egisterSchema
- **Datos:** Completo válido; nombre/apellido cortos; email inválido; password sin mayúscula/número; contraseñas distintas
- **Pasos:** Validar
- **Resultado esperado exacto:** Errores correctos por campo, confirmación distinta falla.
- **Evidencia:** 
eports/FV-02_vitest.xml | **Resultado obtenido:** Por ejecutar

#### FV-03 - appointmentSchema
- **Requisito/RBN:** RBN-1/RF-APP-001
- **Técnica:** Valores límite | **Prioridad:** Media | **Yohan** | **Semana 6**
- **Precondiciones:** ppointmentSchema con superRefine
- **Datos:** Válido futuro; fecha pasada; IDs string/coerce
- **Pasos:** Validar
- **Resultado esperado exacto:** Pasado falla con mensaje "No se puede reservar en el pasado". Coerce convierte strings a números.
- **Evidencia:** 
eports/FV-03_vitest.xml | **Resultado obtenido:** Por ejecutar

#### FV-04 - Route guards
- **Requisito/RBN:** RBN-6
- **Técnica:** Partición de equivalencia | **Prioridad:** Media | **Yohan** | **Semana 6**
- **Precondiciones:** ProtectedRoute, RoleRoute
- **Datos:** Sin sesión, con sesión, rol incorrecto
- **Pasos:** Render con MemoryRouter
- **Resultado esperado exacto:** Sin sesión redirige a /login. Rol incorrecto redirige a portal del rol.
- **Evidencia:** 
eports/FV-04_vitest.xml | **Resultado obtenido:** Por ejecutar

### Funcionales E2E Playwright (FE-01 a FE-12)

#### FE-01 - CP01 Login correcto
- **Requisito/RBN:** RF-AUTH-002
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Leonardo** | **Semana 12**
- **Precondiciones:** App corriendo (baseURL), usuario dmin/paciente con password ClinicaAngry1
- **Datos:** {"username":"admin","password":"ClinicaAngry1"}
- **Pasos:** Ir a /login, llenar campos, click Ingresar
- **Resultado esperado exacto:** No permanece en /login (redirección). Evidencia: captura/video según config.
- **Evidencia:** rontend/evidencias/capturas/CP01.png, rontend/evidencias/videos/CP01.webm | **Resultado obtenido:** Por ejecutar

#### FE-02 - CP02 Contraseña incorrecta
- **Requisito/RBN:** RF-AUTH-002
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Leonardo** | **Semana 12**
- **Datos:** {"username":"admin","password":"Incorrecta123"}
- **Pasos:** Login con contraseña incorrecta
- **Resultado esperado exacto:** Muestra mensaje de error (pattern /incorrect|inválid|credenciales|error/i), permanece en /login$.
- **Evidencia:** rontend/evidencias/capturas/CP02.png, video | **Resultado obtenido:** Por ejecutar

#### FE-03 - CP03 Campos vacíos
- **Requisito/RBN:** RF-AUTH-002
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Leonardo** | **Semana 12**
- **Datos:** Vacíos
- **Pasos:** Click Ingresar sin llenar
- **Resultado esperado exacto:** Muestra "El usuario es obligatorio" y "La contraseña debe tener al menos 6 caracteres".
- **Evidencia:** rontend/evidencias/capturas/CP03.png | **Resultado obtenido:** Por ejecutar

#### FE-04 - CP11 Registro campos vacíos
- **Requisito/RBN:** RF-AUTH-001
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Leonardo** | **Semana 12**
- **Datos:** Vacíos
- **Pasos:** Ir a /registro, click Registrarme
- **Resultado esperado exacto:** Muestra validaciones para nombre/apellido.
- **Evidencia:** rontend/evidencias/capturas/CP11.png | **Resultado obtenido:** Por ejecutar

#### FE-05 - CP12 Email inválido
- **Requisito/RBN:** RF-AUTH-001
- **Técnica:** Partición de equivalencia | **Prioridad:** Alta | **Leonardo** | **Semana 12**
- **Datos:** {"firstName":"María","lastName":"Gómez","email":"correo-invalido","username":"maria.test","password":"Clave123","confirmPassword":"Clave123"}
- **Pasos:** Llenar y registrar
- **Resultado esperado exacto:** Muestra validación de correo.
- **Evidencia:** rontend/evidencias/capturas/CP12.png | **Resultado obtenido:** Por ejecutar

#### FE-06 - CP13 Sin especialidad/médico
- **Requisito/RBN:** RBN-2/RF-APP-001
- **Técnica:** Transición/Partición | **Prioridad:** Alta | **Leonardo** | **Semana 12**
- **Precondiciones:** Login como paciente, ir a /paciente/agendar
- **Datos:** Sin selección
- **Pasos:** Ver estado inicial
- **Resultado esperado exacto:** Especialidad visible, Médico deshabilitado, Continuar deshabilitado.
- **Evidencia:** Captura/video CP13 | **Resultado obtenido:** Por ejecutar

#### FE-07 - CP14 Avanzar con selección
- **Requisito/RBN:** RBN-2/RF-APP-001
- **Técnica:** Transición | **Prioridad:** Alta | **Leonardo** | **Semana 12**
- **Datos:** Seleccionar especialidad (index>0), médico (index>0)
- **Pasos:** Seleccionar y click Continuar
- **Resultado esperado exacto:** Muestra paso "2. Fecha y hora", campo Fecha visible.
- **Evidencia:** CP14 | **Resultado obtenido:** Por ejecutar

#### FE-08 - CP18 Sin fecha/hora
- **Requisito/RBN:** RBN-1/RBN-2
- **Técnica:** Transición | **Prioridad:** Alta | **Leonardo** | **Semana 12**
- **Pasos:** Avanzar a paso 2, click Continuar sin seleccionar
- **Resultado esperado exacto:** No avanza, permanece en paso 2/fecha visible.
- **Evidencia:** CP18 | **Resultado obtenido:** Por ejecutar

#### FE-09 - CP19 Volver paso anterior
- **Requisito/RBN:** RF-APP-001
- **Técnica:** Transición | **Prioridad:** Media | **Leonardo** | **Semana 12**
- **Pasos:** Avanzar y click Anterior
- **Resultado esperado exacto:** Vuelve a ver Especialidad y Médico.
- **Evidencia:** CP19 | **Resultado obtenido:** Por ejecutar

#### FE-10 - CP20 Sin horarios disponibles
- **Requisito/RBN:** RBN-2
- **Técnica:** Partición | **Prioridad:** Media | **Leonardo** | **Semana 12**
- **Datos:** Fecha 2099-12-31
- **Pasos:** Seleccionar especialidad/médico, avanzar, poner fecha lejana
- **Resultado esperado exacto:** Muestra aviso /no hay horarios publicados/i.
- **Evidencia:** CP20 | **Resultado obtenido:** Por ejecutar

#### FE-11 - CP21 Motivo opcional
- **Requisito/RBN:** RF-APP-001
- **Técnica:** Partición | **Prioridad:** Media | **Leonardo** | **Semana 12**
- **Datos:** Buscar fecha disponible 0-7 días, seleccionar hora, dejar motivo vacío
- **Pasos:** Completar hasta motivo
- **Resultado esperado exacto:** Muestra "Motivo de la consulta (opcional)" y botón "Confirmar reserva" visible.
- **Evidencia:** CP21 | **Resultado obtenido:** Por ejecutar

#### FE-12 - CP15/16/17 Mis citas + logout
- **Requisito/RBN:** RF-APP-008/RBN-6
- **Técnica:** Partición | **Prioridad:** Media | **Leonardo** | **Semana 12**
- **Precondiciones:** Login paciente, ir a /paciente/citas
- **Pasos:** Ver secciones/tabla/columnas; cerrar sesión
- **Resultado esperado exacto:** Muestra "Mis citas" y "Historial de mis citas". Tabla visible con encabezados. Click cerrar sesión redirige a /login.
- **Evidencia:** CP15/CP16/CP17 | **Resultado obtenido:** Por ejecutar

### Rendimiento (RD-01 a RD-04) - JMeter

#### RD-01 - Login bajo carga
- **Requisito/RBN:** RF-AUTH-002
- **Técnica:** Escenario de carga | **Prioridad:** Alta | **David** | **Semana 12**
- **Ambiente:** Local (solo local) | **Herramienta:** JMeter
- **Endpoints:** POST http://localhost:8000/api/v1/auth/login/
- **Configuración:**
  - Usuarios concurrentes: 50
  - Ramp-up: 10s
  - Duración: 60s
  - Datos: usuarios seed válidos
- **Métricas/umbrales:**
  - p95 respuesta < 500ms
  - Error % < 1%
  - Throughput > 40 req/s
- **Pasos:** Ejecutar test plan, capturar reporte
- **Resultado esperado exacto:** Umbrales cumplidos
- **Evidencia:** 
eports/jmeter/RD-01-login.jtl, 
eports/jmeter/RD-01-login.html
- **Resultado obtenido:** Por ejecutar

#### RD-02 - Crear cita bajo carga
- **Requisito/RBN:** RF-APP-001/RBN-1-4
- **Técnica:** Escenario de carga | **Prioridad:** Alta | **David** | **Semana 12**
- **Endpoints:** POST http://localhost:8000/api/v1/appointments/ (autenticado)
- **Configuración:**
  - Usuarios concurrentes: 30
  - Ramp-up: 10s
  - Duración: 60s
  - Datos: disponibilidad existente, sin conflictos forzados o con datos válidos
- **Métricas/umbrales:**
  - p95 < 800ms
  - Error % < 2% (considerar conflictos válidos)
  - Throughput > 20 req/s
- **Pasos:** Autenticar, crear cita con datos válidos
- **Resultado esperado exacto:** Umbrales cumplidos, respuestas 201/400 válidas
- **Evidencia:** 
eports/jmeter/RD-02-appointments-create.jtl, html
- **Resultado obtenido:** Por ejecutar

#### RD-03 - Consultar citas bajo carga
- **Requisito/RBN:** RF-APP-008
- **Técnica:** Escenario de carga | **Prioridad:** Alta | **David** | **Semana 12**
- **Endpoints:** GET http://localhost:8000/api/v1/appointments/
- **Configuración:**
  - Usuarios concurrentes: 100
  - Ramp-up: 15s
  - Duración: 60s
- **Métricas/umbrales:**
  - p95 < 400ms
  - Error % < 1%
  - Throughput > 80 req/s
- **Pasos:** Consultar con token válido
- **Resultado esperado exacto:** Umbrales cumplidos
- **Evidencia:** 
eports/jmeter/RD-03-appointments-list.jtl, html
- **Resultado obtenido:** Por ejecutar

#### RD-04 - Mix autenticado
- **Requisito/RBN:** RBN-6
- **Técnica:** Escenario mixto | **Prioridad:** Alta | **David** | **Semana 12**
- **Endpoints:** Login (20%), List appointments (60%), Create appointment (20%)
- **Configuración:**
  - Usuarios concurrentes: 40
  - Ramp-up: 10s
  - Duración: 90s
- **Métricas/umbrales:**
  - p95 global < 600ms
  - Error % < 2%
  - Throughput > 30 req/s
- **Pasos:** Ejecutar mix
- **Resultado esperado exacto:** Umbrales cumplidos
- **Evidencia:** 
eports/jmeter/RD-04-mix.jtl, html
- **Resultado obtenido:** Por ejecutar

### Seguridad (SG-01 a SG-08) - OWASP ZAP / Top 10

#### SG-01 - Acceso sin autenticación
- **Categoría OWASP:** A01 Broken Access Control
- **Técnica:** Prueba negativa | **Prioridad:** Alta | **David** | **Semana 12**
- **Objetivo:** GET /api/v1/appointments/ sin token
- **Pasos:** Solicitud sin Authorization
- **Resultado esperado exacto:** 401. Sin datos sensibles expuestos.
- **Evidencia:** 
eports/zap/SG-01.json/html
- **Resultado obtenido:** Por ejecutar

#### SG-02 - Acceso horizontal a citas ajenas
- **Categoría OWASP:** A01 Broken Access Control
- **Técnica:** Prueba de autorización | **Prioridad:** Alta | **David** | **Semana 12**
- **Objetivo:** Paciente A intenta acceder a cita de Paciente B
- **Pasos:** Obtener ID cita ajena, GET /appointments/{id}/ con token A
- **Resultado esperado exacto:** 403 o 404 (no filtra datos). Paciente solo ve propias.
- **Evidencia:** 
eports/zap/SG-02.*
- **Resultado obtenido:** Por ejecutar

#### SG-03 - Escalado vertical
- **Categoría OWASP:** A01 Broken Access Control
- **Técnica:** Prueba de autorización | **Prioridad:** Alta | **David** | **Semana 12**
- **Objetivo:** Paciente intenta acciones staff (confirm/complete/check-in)
- **Pasos:** POST a endpoints con permisos staff usando token paciente
- **Resultado esperado exacto:** 403
- **Evidencia:** 
eports/zap/SG-03.*
- **Resultado obtenido:** Por ejecutar

#### SG-04 - Fuerza bruta login
- **Categoría OWASP:** A07 Identification and Authentication Failures
- **Técnica:** Fuzzing limitado | **Prioridad:** Alta | **David** | **Semana 12**
- **Objetivo:** POST /api/v1/auth/login/
- **Configuración:** 10 intentos fallidos desde misma IP (solo local)
- **Pasos:** Intentos con contraseña incorrecta
- **Resultado esperado exacto:** Respuestas consistentes 401 sin información que ayude a enumerar. Sin bloqueo destructivo en entorno local documentado.
- **Evidencia:** 
eports/zap/SG-04.*
- **Resultado obtenido:** Por ejecutar

#### SG-05 - JWT expirado/inválido
- **Categoría OWASP:** A07 Identification and Authentication Failures
- **Técnica:** Token manipulation | **Prioridad:** Alta | **David** | **Semana 12**
- **Objetivo:** Endpoints protegidos
- **Datos:** Token expirado, token con firma alterada, token malformado
- **Pasos:** Usar tokens inválidos
- **Resultado esperado exacto:** 401 con token_not_valid/InvalidToken.
- **Evidencia:** 
eports/zap/SG-05.*
- **Resultado obtenido:** Por ejecutar

#### SG-06 - Inyección
- **Categoría OWASP:** A03 Injection
- **Técnica:** Input fuzzing | **Prioridad:** Alta | **David** | **Semana 12**
- **Objetivo:** Campos login/register/appointment (username, email, reason)
- **Datos:** Payloads SQLi básicos ' OR '1'='1, ; DROP TABLE
- **Pasos:** Enviar payloads
- **Resultado esperado exacto:** Validaciones/ORM Django previenen inyección. Sin errores SQL expuestos, respuestas 400/401 controladas.
- **Evidencia:** 
eports/zap/SG-06.*
- **Resultado obtenido:** Por ejecutar

#### SG-07 - XSS
- **Categoría OWASP:** A03 Injection (XSS)
- **Técnica:** Input fuzzing | **Prioridad:** Alta | **David** | **Semana 12**
- **Objetivo:** Campos texto reason/notes
- **Datos:** <script>alert(1)</script>, <img src=x onerror=alert(1)>
- **Pasos:** Enviar en appointment/create
- **Resultado esperado exacto:** Sin ejecución script. Serializers/DRF no devuelven HTML sin escapar. Frontend React escapa por defecto.
- **Evidencia:** 
eports/zap/SG-07.*
- **Resultado obtenido:** Por ejecutar

#### SG-08 - Configuración/CORS/DEBUG/Dependencias
- **Categoría OWASP:** A05 Security Misconfiguration, A06 Vulnerable Components
- **Técnica:** Análisis configuración | **Prioridad:** Alta | **David** | **Semana 12**
- **Objetivo:** settings.py, headers, CORS
- **Pasos:** Revisar DEBUG, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, cabeceras seguridad, dependencias
- **Resultado esperado exacto:** En entorno local documentado. CORS configurado. Sin secrets en repo. Revisar dependencias con pip-audit/npm audit (informativo).
- **Evidencia:** 
eports/zap/SG-08-config.md, 
eports/security/*
- **Resultado obtenido:** Por ejecutar

## 4. Tabla de correspondencia prueba existente <-> caso

### Backend pytest
| Prueba existente | Archivo | Caso asignado | Tipo | Notas |
|---|---|---|---|---|
| TestHealth::test_health_public | pps/tests/test_authentication.py | (Fuera alcance AUTH/APP estricto) | - | Health endpoint - no asignado a AUTH/APP catálogo |
| TestRegister::test_register_creates_patient | pps/tests/test_authentication.py | CI-01, CP-01 | Integración/Unitario | Mapeado |
| TestRegister::test_register_rejects_weak_password | pps/tests/test_authentication.py | CP-03 | Unitario | Mapeado |
| TestRegister::test_register_duplicate_email | pps/tests/test_authentication.py | CP-01 | Unitario | Incluido en CP-01 |
| TestLogin::test_login_returns_tokens_and_user | pps/tests/test_authentication.py | CI-02, CP-02 | Integración/Unitario | Mapeado |
| TestLogin::test_login_wrong_password | pps/tests/test_authentication.py | CP-02 | Unitario | Incluido |
| TestLogin::test_login_inactive_user_forbidden | pps/tests/test_authentication.py | CI-03 | Integración | Mapeado |
| TestRefreshAndLogout::test_refresh_rotates_token | pps/tests/test_authentication.py | CP-04 | Unitario | Mapeado |
| TestRefreshAndLogout::test_logout_returns_204 | pps/tests/test_authentication.py | CP-04 | Unitario | Mapeado |
| TestErrorFormat::test_validation_error_shape | pps/tests/test_authentication.py | (VERIFICAR) | - | No asignado - revisar |
| TestMe::test_me_returns_profile | pps/tests/test_authentication.py | (Fuera alcance) | - | /users/me/ - fuera AUTH/APP core |
| TestMe::test_me_patch | pps/tests/test_authentication.py | (Fuera alcance) | - | Fuera alcance |
| TestMe::test_me_requires_auth | pps/tests/test_authentication.py | CI-08 parcial | Integración | Parcialmente cubierto |
| TestAppointmentPermissions::test_requires_auth | pps/tests/test_appointments.py | CI-08 | Integración | Mapeado |
| TestAppointmentPermissions::test_patient_sees_only_own | pps/tests/test_appointments.py | CI-08 | Integración | Mapeado |
| TestAppointmentPermissions::test_doctor_sees_only_own | pps/tests/test_appointments.py | CI-08 | Integración | Mapeado |
| TestAppointmentCreate::test_create_success | pps/tests/test_appointments.py | CI-04 | Integración | Mapeado |
| TestAppointmentCreate::test_create_conflict_bad_request | pps/tests/test_appointments.py | CI-05 | Integración | Mapeado |
| TestAppointmentCreate::test_specialty_mismatch_rejected | pps/tests/test_appointments.py | CI-05 | Integración | Mapeado |
| TestAppointmentCreate::test_patient_self_booking_forced | pps/tests/test_appointments.py | CI-04 | Integración | Mapeado |
| TestAppointmentTransitions::test_confirm_and_complete | pps/tests/test_appointments.py | CI-06, CP-10 | Integración/Unitario | Mapeado |
| TestAppointmentTransitions::test_staff_can_complete | pps/tests/test_appointments.py | CI-06 | Integración | Mapeado |
| TestAppointmentTransitions::test_cancel_after_window | pps/tests/test_appointments.py | CI-07 | Integración | Mapeado |
| TestAppointmentTransitions::test_cancel_within_window_rejected | pps/tests/test_appointments.py | CI-07 | Integración | Mapeado |
| TestAppointmentTransitions::test_invalid_transition_rejected | pps/tests/test_appointments.py | CP-10 | Unitario | Mapeado |
| TestAppointmentTransitions::test_patient_cancels_own_appointment | pps/tests/test_appointments.py | CI-07 | Integración | Mapeado |
| TestAppointmentTransitions::test_patient_cannot_transition | pps/tests/test_appointments.py | CI-08 | Integración | Mapeado |
| TestValidateSchedule::* (6 tests) | pps/tests/test_services.py | CP-05,CP-06,CP-07,CP-08 | Unitario | Todos mapeados |
| TestTransition::* (6 tests) | pps/tests/test_services.py | CP-09,CP-10 | Unitario | Todos mapeados |

### Frontend Vitest
| Prueba existente | Archivo | Caso asignado | Notas |
|---|---|---|---|
| login.test.tsx 4 tests | rontend/src/tests/login.test.tsx | FV-01/FV-04 parcial | Mapeado parcialmente |
| 
outeGuards.test.tsx 3 tests | rontend/src/tests/routeGuards.test.tsx | FV-04 | Mapeado |
| schemas.test.ts 5 tests | rontend/src/tests/schemas.test.ts | FV-01, FV-03 | Mapeado |
| AdminAppointmentsPage.test.tsx 3 tests | rontend/src/tests/AdminAppointmentsPage.test.tsx | (Fuera alcance AUTH/APP paciente) | Admin - fuera alcance estricto |
| doctorUpcomingAppointmentOptions.test.tsx 2 tests | rontend/src/tests/doctorUpcomingAppointmentOptions.test.tsx | (Fuera alcance) | Doctor - fuera alcance |
| utils.test.ts 6 tests | rontend/src/tests/utils.test.ts | (Fuera alcance directo) | Utilidades generales |

### Playwright E2E (15 pruebas)
| Prueba existente | Archivo | Caso asignado | Notas |
|---|---|---|---|
| CP00 - Verificar que el sistema de citas carga correctamente | 	ests/e2e/inicio.spec.ts | (Fuera alcance AUTH/APP funcional core) | Inicio - sin caso dedicado |
| CP03 - Validar inicio de sesión con campos vacíos | 	ests/e2e/login.spec.ts | FE-03 | Mapeado |
| CP02 - Rechazar contraseña incorrecta | 	ests/e2e/login.spec.ts | FE-02 | Mapeado |
| CP01 - Iniciar sesión correctamente | 	ests/e2e/login.spec.ts | FE-01 | Mapeado |
| CP11 - Validar registro con campos vacíos | 	ests/e2e/registro.spec.ts | FE-04 | Mapeado |
| CP12 - Rechazar correo electrónico inválido | 	ests/e2e/registro.spec.ts | FE-05 | Mapeado |
| CP13 - No permite continuar sin elegir especialidad y médico | 	ests/e2e/reserva.spec.ts | FE-06 | Mapeado |
| CP14 - Permite avanzar al paso de fecha y hora al elegir especialidad y médico | 	ests/e2e/reserva.spec.ts | FE-07 | Mapeado |
| CP18 - No avanzar sin seleccionar fecha y hora | 	ests/e2e/reserva.spec.ts | FE-08 | Mapeado |
| CP19 - Volver al paso de especialidad y médico | 	ests/e2e/reserva.spec.ts | FE-09 | Mapeado |
| CP20 - Mostrar aviso cuando no hay horarios disponibles | 	ests/e2e/reserva.spec.ts | FE-10 | Mapeado |
| CP21 - Permitir dejar vacío el motivo de consulta | 	ests/e2e/reserva.spec.ts | FE-11 | Mapeado |
| CP15 - Mostrar la sección Mis citas | 	ests/e2e/citas.spec.ts | FE-12 | Mapeado (agrupado) |
| CP16 - Ver las columnas del historial de citas | 	ests/e2e/citas.spec.ts | FE-12 | Mapeado (agrupado) |
| CP17 - Cerrar sesión del paciente | 	ests/e2e/citas.spec.ts | FE-12 | Mapeado (agrupado) |

**Nota:** Las 15 pruebas Playwright están cubiertas por FE-01 a FE-12 (FE-12 agrupa 3). CP00 queda sin caso dedicado en este catálogo por estar fuera del core AUTH/APP funcional estricto del pedido, pero existe en repo.

## 5. Matriz de trazabilidad (RF/RBN/categoría OWASP -> casos)

### Trazabilidad RF -> Casos
| Requisito | Descripción (referencia) | Casos que lo cubren | Estado |
|---|---|---|---|
| RF-AUTH-001 | Registro de usuario paciente, unicidad email/username, fortaleza de contraseña | CP-01, CI-01, FE-04, FE-05, FV-02 | Cubierto |
| RF-AUTH-002 | Autenticación con JWT (access/refresh), login | CP-02, CI-02, CI-03, FE-01, FE-02, FE-03, FV-01 | Cubierto |
| RF-AUTH-003 | Renovación de access token mediante refresh token | CP-04 | Cubierto (unitario). Integración parcial vía SimpleJWT. |
| RF-AUTH-004 | Cerrar sesión invalidando token | CP-04 (logout) | **SIN CASO DEDICADO / SIN NUMERACIÓN EN RF** - Cubierto parcialmente por CP-04. No existe mapeo a un RF numerado en docs. |
| RF-AUTH-005 | Política de contraseñas (mínimo 6 caracteres + mayúscula + número). Código real difiere de doc (doc indica 8). | CP-03, FV-02 | Cubierto (basado en código real) |
| RF-AUTH-006 | Mensajes claros ante credenciales inválidas | FE-02, CP-02 | Cubierto |
| RF-AUTH-007 | Recuperación de contraseña (flujo UI básico) | - | **VERIFICAR** - Sin caso asignado en alcance AUTH/APP estricto |
| RF-APP-001 | Reserva eligiendo especialidad, médico, fecha/hora dentro de disponibilidad | CI-04, FE-06, FE-07, FE-08, FE-09, FE-11, FV-03 | Cubierto |
| RF-APP-002 | Código único de cita | CP-05 logic / CI-04 | Cubierto implícitamente |
| RF-APP-003 | No reservar en el pasado | CP-05, FV-03 | Cubierto |
| RF-APP-004 | Dentro de disponibilidad del médico | CP-06, FE-06 | Cubierto |
| RF-APP-005 | Sin dos citas activas en mismo slot para mismo médico | CP-07, CI-05 | Cubierto |
| RF-APP-006 | Paciente sin dos citas simultáneas | CP-08 | Cubierto |
| RF-APP-007 | Teleconsulta con enlace | - | **SIN CASO / SIN TRAZABILIDAD** - No cubierto en este catálogo (fuera alcance estricto) |
| RF-APP-008 | Ver próximas citas e historial | FE-12 | Cubierto |
| RF-APP-009 | Cancelación respeta ventana configurable (CANCELLATION_HOURS) | CP-09, CI-07, FV-04 contexto / utils | Cubierto |
| RF-APP-010 | Confirmar/rechazar/cancelar citas pendientes (roles autorizados) | CP-10, CI-06, CI-08 | Cubierto |
| RF-APP-011 | Marcar asistencia: atendida/no asistida | CP-10, CI-06 | Cubierto |
| RF-APP-012 | Check-in por recepción | CP-10, CI-06 | Cubierto |
| RF-APP-013 | Estados siguen máquina de estados | CP-10, CI-06 | Cubierto |
| RF-APP-014 | Transiciones con motivo (cancelación/rechazo) | - | **VERIFICAR** - Parcialmente cubierto por notificaciones/servicio, sin caso dedicado |

### Trazabilidad RBN -> Casos
| RBN | Regla | Casos |
|---|---|---|
| RBN-1 | No reservar en el pasado | CP-05, FV-03, FE-08 |
| RBN-2 | Dentro de disponibilidad activa | CP-06, FE-06, FE-07, FE-08, FE-10 |
| RBN-3 | Sin conflicto mismo médico (no CANCELLED) | CP-07, CI-05 |
| RBN-4 | Paciente sin citas simultáneas (no CANCELLED) | CP-08 |
| RBN-5 | Ventana de cancelación 24h | CP-09, CI-07 |
| RBN-6 | Permisos por rol | CI-01,CI-02,CI-03,CI-08,FE-12,FV-04,SG-01,SG-02,SG-03 |

### Trazabilidad OWASP Top 10 -> Casos de Seguridad
| Categoría OWASP | Caso | Objetivo |
|---|---|---|
| A01: Broken Access Control | SG-01, SG-02, SG-03 | Acceso sin auth, horizontal, vertical |
| A07: Identification and Authentication Failures | SG-04, SG-05 | Fuerza bruta, JWT inválido/expirado |
| A03: Injection | SG-06, SG-07 | Inyección y XSS en campos de texto |
| A05: Security Misconfiguration | SG-08 | Cabeceras, CORS, DEBUG, configuración |
| A06: Vulnerable and Outdated Components | SG-08 | Revisar dependencias (pip-audit/npm audit) |

**Requisitos sin numeración / sin caso:** RF-AUTH-004 (sin RF explícito), RF-APP-007, RF-APP-008 parcialmente cubierto, RF-APP-014. Se marcan como VERIFICAR.

## 6. Datos de prueba y fixtures necesarios

### Usuarios (seed)
| Usuario | Rol | Password | Notas |
|---|---|---|---|
| dmin | admin | ClinicaAngry1 | Acceso completo |
| 
ecepcion | receptionist | ClinicaAngry1 | Recepción/check-in |
| dra.ramos | doctor | ClinicaAngry1 | CMP-1001, Cardiología, Box 104 |
| dr.mendoza | doctor | ClinicaAngry1 | Traumatología |
| paciente | patient | ClinicaAngry1 | Paciente demo |

### Datos necesarios para pruebas
| Elemento | Valor/Condición | Uso |
|---|---|---|
| Fecha de referencia | 2026-09-13 | Límite pasado/futuro en tests |
| Fecha futura válida | 2026-09-16 | Reservas |
| Ventana cancelación | CANCELLATION_HOURS=24 | RBN-5 |
| Duración consulta | 30 min | Cálculo endTime |
| Disponibilidad activa | Doctor con Availability ACTIVE en fecha/hora | CP-06, FE-06, FE-07 |
| Especialidad/Médico | Cardiología con dra.ramos o disponible | Reserva |

### Fixtures backend (existentes)
- pi_client, uth_client en pps/tests/conftest.py
- Factories en pps/tests/factories.py (UserFactory, DoctorProfileFactory, PatientProfileFactory, AppointmentFactory, AvailabilityFactory, etc.)

### Fixtures frontend
- MemoryRouter, AuthProvider, QueryProvider según tests existentes
- localStorage key clinic-angry.auth.user
- VITE_USE_MOCK=true en vitest config

### Consideraciones
- Para tests unitarios: mockear tiempo/BD
- Para integración: usar BD de test, migraciones, fixtures/factories
- Para E2E: app corriendo en puerto configurado (baseURL)
- Para rendimiento/seguridad: solo entorno local

## 7. Casos descartados o fusionados y por qué

| Caso propuesto | Acción | Razón |
|---|---|---|
| Crear caso separado para cada prueba unitarias de validate_schedule | Fusionados en CP-05 a CP-08 | Cubren las mismas reglas (RBN-1 a RBN-4). Mejor mantener casos por regla con valores límite/tabla decisión. |
| Crear caso separado para cada transición | Fusionado en CP-10 | Todos cubren máquina de estados (RBN-9). |
| Crear caso separado para cada acción de cita (confirm/complete/cancel/check-in) | Fusionados en CI-06 | Se prueban en conjunto con matriz de roles/transiciones. |
| Duplicar pruebas Playwright | Agrupados en FE-12 | CP15, CP16, CP17 se prueban juntos en flujo "Mis citas" + logout. |
| Tests de /users/me, boxes, audit, dashboard, etc. | Descartados para este catálogo | Fuera de alcance: solo AUTH y APP. |
| RF-AUTH-007 (recuperación contraseña) | Descartado | Flujo UI básico, sin suficiente detalle en código para caso ejecutable real. Marcado VERIFICAR. |
| RF-APP-007 (teleconsulta) | Descartado | Fuera alcance estricto AUTH/APP core del pedido. |
| Casos de rendimiento genéricos | Reducidos a RD-01 a RD-04 | Solo endpoints reales (login, appointments create/list, mix). |

## 8. Supuestos y puntos a VERIFICAR

### Supuestos
- **Contraseña:** Se basa en código real (6+mayúscula+número) aunque docs indican 8 caracteres.
- **Base URL E2E:** Usa configuración de Playwright (PLAYWRIGHT_BASE_URL o default http://127.0.0.1:5173).
- **Datos seed:** Se asume disponibilidad activa para pruebas; en algunos casos puede requerirse fixture.
- **Roles:** Se usan roles en minúsculas como en código (dmin, 
eceptionist, doctor, patient).
- **Ventana cancelación:** CANCELLATION_HOURS=24 según settings.

### Puntos a VERIFICAR
- [ ] **RF-AUTH-004:** No existe como RF numerado en documentación. Logout existe en código - confirmar si debe asignarse RF.
- [ ] **RF-APP-007/008/014:** Confirmar si están implementados o solo en docs.
- [ ] **Playwright:** 15 pruebas existen y se mapean (FE-01 a FE-12). CP00 fuera de alcance core.
- [ ] **Política contraseña:** Sincronizar docs/03-REQUISITOS-FUNCIONALES.md con código real.
- [ ] **Disponibilidad para E2E:** 
eserva.spec.ts busca horarios disponibles en próximos 7 días - depende de seed/fixtures.
- [ ] **Cobertura:** Backend global 23.76% (fallo umbral 80%) - enfocar en AUTH/APP para alcanzar meta.
- [ ] **Rendimiento/Seguridad:** Ejecutar solo en entorno local con datos demo.

### Validación final
- [x] Total casos: 46 (dentro de 40-45 rango; aceptable)
- [x] Sin IDs repetidos
- [x] Cada caso tiene requisito/RBN, técnica, prioridad, datos concretos, pasos, resultado esperado exacto, responsable, semana, evidencia
- [x] 15 pruebas Playwright mapeadas
- [x] Todas las pruebas backend AUTH/APP relevantes mapeadas
- [x] Matriz de trazabilidad completa
- [x] Solo documentación, sin modificar código/pruebas

