# Diseño de Pruebas - Clínica Angry

## 1. Descripción y Alcance

**Sistema bajo prueba:** Clínica Angry - Sistema de Gestión de Citas Médicas  
**Repositorio:** [https://github.com/brandy-sinche-dev/proyecto-pruebas-sistema-de-citas](https://github.com/brandy-sinche-dev/proyecto-pruebas-sistema-de-citas/)  
**Stack:** React 19 + TypeScript + Vite (frontend), Django + DRF (backend), PostgreSQL, JWT SimpleJWT, Docker Compose, GitHub Actions  
**Fecha de referencia para pruebas:** `2026-09-13`  
**Alcance:** Únicamente módulos **AUTH** (Autenticación) y **APP** (Citas). El módulo **SCH** (Disponibilidad) se considera solo como apoyo/dependencia.  
**Fuera de alcance:** Pacientes, médicos, especialidades, boxes, notificaciones, facturación, proveedores reales.

### 1.1 Roles
Los roles reales en código/BD/frontend son en minúsculas: `admin`, `receptionist`, `doctor`, `patient`. Sus etiquetas visuales son `ADMIN`, `RECEPTIONIST`, `DOCTOR`, `PATIENT`.

### 1.2 Estados de Citas
Estados reales: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `COMPLETED`, `NO_SHOW`, `CANCELLED`

### 1.3 Reglas de Negocio (RBN)
| ID | Regla | Referencia |
|---|---|---|
| RBN-1 | No se puede reservar citas en el pasado. | `backend/apps/appointments/services.py:42-45` |
| RBN-2 | La cita debe caer dentro de la disponibilidad activa del médico para esa fecha. | `backend/apps/appointments/services.py:47-49` |
| RBN-3 | No pueden existir dos citas activas (no CANCELLED) en el mismo slot para el mismo médico. | `backend/apps/appointments/services.py:51-58` |
| RBN-4 | Un paciente no puede tener dos citas simultáneas (no CANCELLED). | `backend/apps/appointments/services.py:60-67` |
| RBN-5 | La cancelación debe respetar la ventana configurable `CANCELLATION_HOURS` (24h). | `backend/apps/appointments/services.py:70-74`, `config/settings.py:143`, `frontend/src/lib/utils.ts` |
| RBN-6 | Solo usuarios autorizados acceden a recursos protegidos según rol (permisos). | `backend/apps/users/permissions.py:8-40`, `frontend/src/features/layout/routeGuards.tsx` |

### 1.4 Máquinas de Estados
`VALID_TRANSITIONS` en `backend/apps/appointments/services.py:12-27`:
```python
PENDING → CONFIRMED, CANCELLED
CONFIRMED → CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW
CHECKED_IN → COMPLETED, NO_SHOW
COMPLETED, CANCELLED, NO_SHOW → (terminales)
```

## 2. Comandos Reales

### Backend
```bash
uv sync --frozen
uv run ruff check .
uv run pytest --cov --cov-report=html
# Cobertura mínima configurada: --cov-fail-under=80
```

### Frontend
```bash
pnpm install --frozen-lockfile
pnpm lint  # oxlint
pnpm test -- --coverage  # vitest run
pnpm build
# Cobertura incluye: src/components, src/features, src/lib, src/schemas
```

### E2E (VERIFICAR)
> **VERIFICAR:** No se encontraron archivos `*.spec.ts` ni configuración de Playwright en el repositorio. El README menciona `tests/e2e` pero no existe configuración/comandos explícitos. Se requiere confirmar existencia y comando real antes de ejecutar.

## 3. Criterio de Priorización

| Nivel | Criterio (Riesgo e Impacto) | Justificación |
|---|---|---|
| **Alta** | Reglas de negocio críticas (RBN), autenticación JWT, transiciones de estado, conflictos de agenda, permisos y flujos que bloquean el core del sistema. | Fallas en estas áreas comprometen la integridad de citas, seguridad o disponibilidad del sistema. |
| **Media** | Validaciones de formularios, persistencia de sesión, redirecciones por rol y cálculos auxiliares con impacto limitado. | Errores que afectan usabilidad pero no comprometen reglas críticas de negocio. |
| **Baja** | Validaciones cosméticas o de formato sin impacto en integridad de datos o seguridad. | Baja probabilidad de generar inconsistencias o brechas de seguridad. |

## 4. Catálogo de Casos de Prueba

### 4.1 Casos de Prueba AUTH

| ID | Módulo/Tipo | Requisito | Técnica | Prioridad | Precondición | Datos de Entrada | Pasos | Resultado Esperado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| CP-01 | AUTH/Unitaria | RF-AUTH-001 - Validar campos de registro, unicidad de email/username y fortaleza de contraseña | Partición de equivalencia | Alta | Importar `RegisterSerializer`. Mock `email_taken`/`username_taken`. | Válido: `firstName="María", lastName="López", email="maria.lopez@example.com", username="maria.lopez", password="P@ssw0rd1!"`. Email duplicado: `email_taken=True`. Email mal formado: `email="maria.lopez@"`. Password sin mayúscula: `"password1"`. Password sin número: `"Password"`. | 1) Validar datos válidos. 2) Validar con email duplicado (mock). 3) Validar con email mal formado. 4) Validar password sin mayúscula. 5) Validar password sin número. | 1) `is_valid()=True`. 2) `is_valid()=False`, error `"Ya existe una cuenta con este correo."`. 3) `is_valid()=False` (formato inválido). 4) `is_valid()=False`, error `"Debe incluir una letra mayúscula."`. 5) `is_valid()=False`, error `"Debe incluir un número."`. | `reports/CP-01_pytest.xml` |
| CP-02 | AUTH/Unitaria | RF-AUTH-002 - Autenticar credenciales y emitir JWT | Partición de equivalencia | Alta | Importar `LoginSerializer`. Mock `django.contrib.auth.authenticate`. | Válido: `username="paciente", password="ClinicaAngry1"`, `authenticate` retorna usuario activo. Inválido: contraseña incorrecta (`authenticate=None`). Inexistente: usuario no existe (`authenticate=None`). | 1) Login con credenciales válidas. 2) Login con contraseña inválida. 3) Login con usuario inexistente. | 1) `validated_data` contiene `access` y `refresh` (JWT 3 segmentos). 2) Error `"No active account found with the given credentials"`. 3) Error `"No active account found with the given credentials"`. | `reports/CP-02_pytest.xml` |
| CP-03 | AUTH/Integración | RF-AUTH-003 - Renovar access token mediante refresh token | Partición de equivalencia | Alta | **Estrategia:** Top-down. **Razón:** la prueba parte del endpoint `POST /api/v1/auth/refresh/` (capa superior) y baja hacia la validación de firma y expiración de SimpleJWT y el estado de tokens en BD. Tokens emitidos para el usuario sembrado `paciente`. | Vigente: refresh con firma válida y `exp` futuro. Inválido: firma corrupta/tipo incorrecto. Vencido: `exp` en pasado. | 1) POST `/api/v1/auth/refresh/` con refresh vigente. 2) POST con refresh inválido. 3) POST con refresh vencido. | 1) `200` con nuevo `access` válido (JWT 3 segmentos). 2) `401` con `InvalidToken`/`token_not_valid`. 3) `401` con `TokenExpired`/`token_not_valid`. | `reports/CP-03_pytest_integration.xml` |
| CP-04 | AUTH/Unitaria | RF-AUTH-005 - Política de contraseña (mínimo 6 + mayúscula + número) | Valores límite | Media | `validate_password_strength` puro. `RegisterSerializer` con `min_length=6`. | `"A1b2c3"` (6 chars, límite inferior). `"A1b2c"` (5 chars). `"A1b2c3D4"` (8 chars). `"a1b2c3"` (sin mayúscula). `"Aaaaaa"` (sin número). `"password"` (sin mayúscula/número). | 1) `validate_password_strength("A1b2c3")`. 2) Serializer con `"A1b2c"`. 3) `validate_password_strength("A1b2c3D4")`. 4) `validate_password_strength("a1b2c3")`. 5) `validate_password_strength("Aaaaaa")`. 6) `validate_password_strength("password")`. | 1) Sin excepción (válido). 2) `is_valid()=False`. 3) Sin excepción (válido). 4) Lanza `PasswordValidationError` con `"Debe incluir una letra mayúscula."`. 5) Lanza `PasswordValidationError` con `"Debe incluir un número."`. 6) Lanza `PasswordValidationError` con `"Debe incluir una letra mayúscula."`. | `reports/CP-04_pytest.xml` |
| CP-05 | AUTH/Integración | RF-AUTH-001 - Registro crea usuario paciente + PatientProfile | Partición de equivalencia | Alta | **Estrategia:** Bottom-up. **Razón:** se integran primero `RegisterSerializer` y el servicio de registro con los modelos `User` y `PatientProfile` en BD, y luego se verifica a través del endpoint `POST /api/v1/auth/register/`. BD de pruebas aislada. | Datos válidos: `firstName`, `lastName`, `email`, `username`, `password` con política válida. | 1) POST `/api/v1/auth/register/` con datos válidos. 2) Verificar usuario creado en BD. 3) Verificar `PatientProfile` asociado. | 1) `201` con respuesta de registro. 2) `User.objects.filter(email=...).exists()=True`, `role='patient'`. 3) `PatientProfile` vinculado al `User` creado. | `reports/CP-05_pytest_integration.xml` |
| CP-06 | AUTH/Integración | RF-AUTH-002 - Login usuario inactivo | Partición de equivalencia | Alta | **Estrategia:** Top-down. **Razón:** parte del endpoint de login y baja hacia la autenticación y la verificación de `is_active` en BD. Usuario inactivo creado en el fixture. | `username="inactivo", password="ClinicaAngry1"` con usuario `is_active=False` en BD. | 1) POST `/api/v1/auth/login/` con usuario inactivo. | `403` con `{"detail":"Cuenta desactivada"}`. | `reports/CP-06_pytest_integration.xml` |
| CP-07 | AUTH/Integración | RF-AUTH-003 - Logout invalida tokens (refresh) | Partición de equivalencia | Alta | **Estrategia:** Top-down. **Razón:** parte del endpoint `POST /api/v1/auth/logout/` y baja hacia el manejo del refresh token (invalidación); el efecto se verifica con una llamada posterior a `refresh`. Usuario sembrado `paciente` autenticado. | Token `access` válido, body `{"refresh": "<refresh_token>"}`. | 1) POST `/api/v1/auth/logout/` con token y refresh. 2) POST `/api/v1/auth/refresh/` con el mismo refresh token. | 1) `200` (logout exitoso). 2) `401` con `token_not_valid`/`InvalidToken`. | `reports/CP-07_pytest_integration.xml` |
| CP-08 | AUTH/Integración | RF-AUTH-002 - Login end-to-end con JWT | Partición de equivalencia | Alta | **Estrategia:** Big bang. **Razón:** se integran a la vez login, emisión de JWT, autenticación de la petición y un recurso protegido, y se prueba el flujo completo en una sola corrida. Usuario sembrado `paciente`. | Credenciales válidas de usuario activo. | 1) POST `/api/v1/auth/login/`. 2) Verificar respuesta contiene `access`, `refresh`, `user` con `role`. 3) GET a recurso protegido con `Authorization: Bearer <access>`. | 1) `200`. 2) Tokens JWT válidos, `user.role` presente. 3) `200` con acceso autorizado. | `reports/CP-08_pytest_integration.xml` |

### 4.2 Casos de Prueba APP

| ID | Módulo/Tipo | Requisito | Técnica | Prioridad | Precondición | Datos de Entrada | Pasos | Resultado Esperado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| CP-09 | APP/Unitaria | RF-APP-002 - Generar código único de cita | Partición de equivalencia | Baja | Mock `Appointment.objects.aggregate(Max("code"))`. | `date_="2026-09-16"`. Sin citas previas, luego con `CIT-2026-0001` existente. | 1) Llamar `next_appointment_code("2026-09-16")`. 2) Simular cita con `CIT-2026-0001`. 3) Llamar nuevamente. | 1) `CIT-2026-0001`. 2) `CIT-2026-0002`. 3) Formato `CIT-{año}-{secuencia:04d}`, únicos y secuenciales. | `reports/CP-09_pytest.xml` |
| CP-10 | APP/Unitaria | RF-APP-003 / RBN-1 - No reservar en el pasado | Valores límite | Alta | Mock `timezone.localdate()=2026-09-13`. | `date_="2026-09-12"` (ayer), `"2026-09-13"` (hoy), `"2026-09-14"` (mañana). `start_time="10:00"`. | 1) Validar fecha pasada. 2) Validar fecha actual. 3) Validar fecha futura. | 1) Lanza `AppointmentValidationError("No se pueden registrar citas en el pasado.")`. 2) No lanza por RBN-1. 3) No lanza por RBN-1. | `reports/CP-10_pytest.xml` |
| CP-11 | APP/Unitaria | RF-APP-003 / RBN-1 - Cita hoy debe iniciar en futuro | Valores límite | Alta | Mock `timezone.localdate()=2026-09-13`, `datetime.now().time()=10:00`. | `date_="2026-09-13", start_time="10:00"` (igual), `"09:59"` (pasado), `"10:01"` (futuro). | 1) start_time igual a ahora. 2) start_time anterior. 3) start_time posterior. | 1) Lanza `AppointmentValidationError("La cita debe iniciar en el futuro.")`. 2) Lanza `AppointmentValidationError("La cita debe iniciar en el futuro.")`. 3) No lanza por esta regla. | `reports/CP-11_pytest.xml` |
| CP-12 | APP/Unitaria | RF-APP-004 / RBN-2 - Disponibilidad activa | Partición de equivalencia | Alta | Doctor con disponibilidad `ACTIVE` `2026-09-16 09:00-12:00`. Sin conflicts. Mock queryset de disponibilidad. | `start_time="10:00", end_time="10:30"` (dentro). `"08:30"` (antes). `"12:30"` (después). Sin disponibilidad ese día. | 1) Dentro del rango. 2) Antes. 3) Después. 4) Sin disponibilidad. | 1) Sin excepción. 2) Lanza `AppointmentValidationError("El médico no tiene disponibilidad para ese horario.")`. 3) Lanza `AppointmentValidationError("El médico no tiene disponibilidad para ese horario.")`. 4) Lanza `AppointmentValidationError("El médico no tiene disponibilidad para ese horario.")`. | `reports/CP-12_pytest.xml` |
| CP-13 | APP/Unitaria | RF-APP-005 / RBN-3 - Conflicto mismo médico mismo slot | Tabla de decisión | Alta | Mock `Appointment.objects.filter(doctor=...).exclude(status="CANCELLED")`. | Caso 1: sin citas. Caso 2: cita `PENDING` 10:00-10:30 mismo médico. Caso 3: cita 10:00-10:30, solicitud 11:00-11:30. | 1) Solicitar sin conflictos. 2) Solicitar mismo slot con cita existente. 3) Solicitar slot diferente. | 1) Sin excepción. 2) Lanza `AppointmentValidationError("El médico ya tiene una cita en ese horario.")`. 3) Sin excepción. | `reports/CP-13_pytest.xml` |
| CP-14 | APP/Unitaria | RF-APP-006 / RBN-4 - Conflicto paciente citas simultáneas | Tabla de decisión | Alta | Mock citas del paciente. | Caso 1: sin citas. Caso 2: cita existente 10:00-11:00, solicitud 10:30-11:00 (solapa). Caso 3: solicitud 12:00-12:30 (no solapa). | 1) Sin conflictos. 2) Con solapamiento. 3) Sin solapamiento. | 1) Sin excepción. 2) Lanza `AppointmentValidationError("El paciente ya tiene una cita a esa hora.")`. 3) Sin excepción. | `reports/CP-14_pytest.xml` |
| CP-15 | APP/Unitaria | RF-APP-009 / RBN-5 - Ventana cancelación límites | Valores límite | Alta | Mock `timezone.now()`. `CANCELLATION_HOURS=24`. Cita `2026-09-16 10:00`. | `now="2026-09-15 09:59"` (24:01 antes). `"2026-09-15 10:00"` (24:00 exacto). `"2026-09-15 10:01"` (23:59 antes). | 1) Más de 24h antes. 2) Exactamente 24h antes. 3) Menos de 24h antes. | 1) `True`. 2) `True`. 3) `False`. | `reports/CP-15_pytest.xml` |
| CP-16 | APP/Unitaria | RF-APP-009 / RBN-5 - Cancelación fuera de ventana lanza error | Valores límite | Alta | `can_cancel=False`. Llamar `transition` a `CANCELLED`. | Cita con < 24h para inicio. | 1) Intentar cancelar con `transition` a `CANCELLED`. | Lanza `AppointmentValidationError("Fuera de la ventana de cancelación.")`. | `reports/CP-16_pytest.xml` |
| CP-17 | APP/Unitaria | RF-APP-010/011/012 - Transiciones válidas e inválidas máquina de estados | Transición de estados | Alta | Usar `assert_transition` con `VALID_TRANSITIONS`. | PENDING→CONFIRMED/CANCELLED; CONFIRMED→CHECKED_IN/COMPLETED/CANCELLED/NO_SHOW; CHECKED_IN→COMPLETED/NO_SHOW; COMPLETED/CANCELLED/NO_SHOW→cualquier otro. | 1) Probar todas las transiciones válidas. 2) Probar transiciones inválidas desde estados terminales y no permitidas. | 1) Sin excepción para transiciones permitidas. 2) Lanza `AppointmentValidationError` con mensaje `"No se puede cambiar de {status} a {target}."` para transiciones no permitidas. | `reports/CP-17_pytest.xml` |
| CP-18 | APP/Unitaria | RF-APP-002 - Crear cita con código autogenerado | Partición de equivalencia | Baja | Mock servicios/dependencias. | Datos válidos para `create_appointment`. | 1) Crear cita vía `create_appointment`. 2) Verificar `code`. 3) Verificar estado inicial. | 1) Cita creada. 2) `code` con formato `CIT-{año}-{secuencia:04d}`. 3) `status=PENDING`. | `reports/CP-18_pytest.xml` |

### 4.3 Casos de Prueba Integración (API + BD)

**Estrategias de integración usadas:**

| Estrategia | Cómo se aplica en este proyecto | Casos |
|---|---|---|
| Top-down | Se parte del endpoint o vista (capa superior) y se integran hacia abajo permisos, servicios y BD. | CP-03, CP-06, CP-07, CP-21 |
| Bottom-up | Se integran primero serializers/servicios con los modelos en BD y luego se prueba a través del endpoint. | CP-05, CP-22, CP-23, CP-25 |
| Sándwich | Se combinan ambos sentidos: capa de permisos descendente y datos sembrados ascendente. | CP-19, CP-24 |
| Big bang | Se integran a la vez todos los módulos del flujo y se prueba de punta a punta. | CP-08, CP-20 |

| ID | Módulo/Tipo | Requisito | Técnica | Prioridad | Precondición | Datos de Entrada | Pasos | Resultado Esperado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| CP-19 | AUTH/Integración | RF-AUTH-002 + RBN-6 - Login y control acceso por rol | Partición de equivalencia | Alta | **Estrategia:** Sándwich. **Razón:** se prueba en ambos sentidos: desde el login y la emisión de JWT hacia los permisos (`IsAdminRole`/`IsAuthenticated`) y desde el recurso protegido hacia los usuarios sembrados en BD. Usuarios `admin` y `paciente` del seed. | Credenciales `admin` (ADMIN), paciente (PATIENT). | 1) POST `/api/v1/auth/login/` admin. 2) GET `/api/v1/specialties/` con token admin. 3) GET sin token. 4) POST `/api/v1/doctors/` con token admin y con token paciente. | 1) `200` con `access`/`refresh`. 2) `200`. 3) `401`. 4) Admin `201`, paciente `403`. | `reports/CP-19_pytest_integration.xml` |
| CP-20 | APP/Integración | RF-APP-001 + RBN-1..4 - Flujo completo reserva | Tabla de decisión | Alta | **Estrategia:** Big bang. **Razón:** el flujo de reserva integra a la vez AUTH, SCH y APP (login, disponibilidad, validación de RBN-1 a RBN-4 y generación de código) y se prueba de punta a punta. **Fixture:** dos médicos del seed (`dra.ramos`, CMP-1001, Cardiología; `dr.mendoza`) con disponibilidad `ACTIVE` el `2026-09-16 09:00-12:00` y un segundo paciente creado en el fixture; reloj fijo `2026-09-13`; IDs numéricos. **VERIFICAR:** la especialidad de `dr.mendoza` (el `specialtyId` debe corresponder a cada médico) y que el fixture cree ambas disponibilidades. | (1) 2026-09-12 10:00, `paciente` con `dra.ramos`, fecha pasada → rechazar (RBN-1). (2) 2026-09-16 13:00, `paciente` con `dra.ramos`, fuera de rango → rechazar (RBN-2). (3) 2026-09-16 10:00, `paciente` con `dra.ramos` → aceptar. (4) 2026-09-16 10:00, segundo paciente con `dra.ramos` (mismo slot) → rechazar (RBN-3). (5) 2026-09-16 10:00, `paciente` con `dr.mendoza` (otro médico con disponibilidad ese día) → rechazar (RBN-4). (6) 2026-09-16 11:00, segundo paciente con `dra.ramos` → aceptar. | 1) Login de `paciente` y del segundo paciente. 2) POST `/api/v1/appointments/` para cada fila, en el orden indicado. 3) Verificar códigos y estados. | (1), (2), (4), (5): `400` con el error de la regla violada. (3), (6): `201` con `code` formato `CIT-...` y `status=PENDING`. La fila 5 usa el mismo paciente, el mismo día y la misma hora (2026-09-16 10:00) con otro médico disponible. | `reports/CP-20_pytest_integration.xml` |
| CP-21 | APP/Integración | RF-APP-010 + RBN-6 - Confirmar/cancelar cita pendiente | Partición de equivalencia | Alta | **Estrategia:** Top-down. **Razón:** parte de los endpoints `confirm/` y `cancel/` y baja hacia los permisos `IsStaffRole`, la máquina de estados y la ventana de cancelación en BD. Cita `PENDING` creada en el fixture; usuarios `dra.ramos` (doctor) y `paciente`. | Cita `PENDING`. Usuarios: médico/staff, paciente. | 1) Médico POST `/api/v1/appointments/{id}/confirm/`. 2) Médico POST `/api/v1/appointments/{id}/cancel/`. 3) Paciente POST `/api/v1/appointments/{id}/confirm/`. | 1) `200`, estado `CONFIRMED`. 2) `200`, estado `CANCELLED` (respetando `CANCELLATION_HOURS=24`). 3) `403`. | `reports/CP-21_pytest_integration.xml` |
| CP-22 | APP/Integración | RF-APP-011/012 + RBN-6 - Check-in, complete, no_show | Partición de equivalencia | Alta | **Estrategia:** Bottom-up. **Razón:** se integran primero las transiciones `CONFIRMED→CHECKED_IN→COMPLETED/NO_SHOW` del servicio con la BD y luego se exponen mediante los endpoints con sus permisos por rol. Cita `CONFIRMED` en el fixture; usuarios `recepcion`, `dra.ramos` y `paciente`. | Cita `CONFIRMED`. Usuarios: `receptionist`, `doctor`, `patient`. | 1) Recepción POST `/api/v1/appointments/{id}/check_in/`. 2) Médico POST `/api/v1/appointments/{id}/complete/`. 3) Médico POST `/api/v1/appointments/{id}/no_show/`. 4) Paciente POST `/api/v1/appointments/{id}/check_in/`. | 1) `200`, estado `CHECKED_IN`. 2) `200`, estado `COMPLETED`. 3) `200`, estado `NO_SHOW`. 4) `403`. | `reports/CP-22_pytest_integration.xml` |
| CP-23 | APP/Integración | RF-APP-001 - Especialidad no corresponde a médico | Partición de equivalencia | Media | **Estrategia:** Bottom-up. **Razón:** se integra primero la validación de `create_appointment` (`SpecialtyMismatchError`) con los modelos en BD y luego se verifica vía `POST /api/v1/appointments/`. Médico y especialidad que no le corresponde, sembrados. | POST `/api/v1/appointments/` con `specialtyId` distinto al de `doctorId`. | 1) Crear cita con especialidad no coincidente. | `400` con `{"detail":"La especialidad no corresponde al médico."}` (`SpecialtyMismatchError`). | `reports/CP-23_pytest_integration.xml` |
| CP-24 | APP/Integración | RBN-6 - Permisos por rol en acciones de citas | Tabla de decisión | Alta | **Estrategia:** Sándwich. **Razón:** permisos cruzados: desde los endpoints de acciones hacia `IsStaffRole` (descendente) y desde los roles sembrados en BD hacia el endpoint (ascendente). Usuarios `admin`, `recepcion`, `dra.ramos` y `paciente`. | Roles `admin`, `receptionist`, `doctor`, `patient`. Acciones `confirm`, `complete`, `no_show`, `check_in`. | 1) Probar cada acción con cada rol según `IsStaffRole`. | Staff (`admin`/`receptionist`/`doctor`) autorizado para acciones según matriz de permisos; `patient` recibe `403` para `confirm/complete/no_show/check_in`. | `reports/CP-24_pytest_integration.xml` |
| CP-25 | APP/Integración | RF-APP-009 - Cancelación con ventana configurada | Valores límite | Alta | **Estrategia:** Bottom-up. **Razón:** se integran `can_cancel` y `transition` con la cita en BD y luego se prueba vía el endpoint de cancelación. `CANCELLATION_HOURS=24`; tiempo controlado. | Paciente cancela con >24h y <24h antes del inicio. | 1) Cancelar con >24h antes. 2) Cancelar con <24h antes. | 1) `200`, estado `CANCELLED`. 2) `400` con `{"detail":"Fuera de la ventana de cancelación."}`. | `reports/CP-25_pytest_integration.xml` |

### 4.4 Casos de Prueba Frontend (Unitarias - Vitest + RTL)

| ID | Módulo/Tipo | RF/RBN | Técnica | Prioridad | Precondición | Datos de Entrada | Pasos | Resultado Esperado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| CP-26 | FRONT/AUTH/Unitaria | RF-AUTH-002 | Partición de equivalencia | Media | Importar `loginSchema`. | Válido: `username="admin", password="ClinicaAngry1"`. Inválido: username vacío, password < 6. | 1) Validar datos válidos. 2) Validar username vacío. 3) Validar password < 6. | 1) Válido. 2) Error de validación. 3) Error por longitud mínima ≥6. | `reports/CP-26_vitest.xml` |
| CP-27 | FRONT/AUTH/Unitaria | RF-AUTH-001 / RF-AUTH-005 | Partición de equivalencia | Media | Importar `registerSchema`. | Válido completo. Inválidos: nombre <2, apellido <2, email inválido, username <3, password sin mayúscula/número <6, confirmación diferente. | 1) Validar completo válido. 2) Probar campos inválidos. 3) Probar confirmación distinta. | 1) Válido. 2) Errores por campo. 3) Error `"Las contraseñas no coinciden"`. | `reports/CP-27_vitest.xml` |
| CP-28 | FRONT/APP/Unitaria | RF-APP-001 / RBN-1 | Valores límite | Media | Importar `appointmentSchema`. | Válido. Inválidos: doctorId/patientId <=0, fecha/hora faltantes, reason >300, fecha pasada. | 1) Válido. 2) IDs <=0. 3) reason >300. 4) Fecha pasada. | 1) Válido. 2) Error de validación. 3) Error por longitud. 4) Error `"No se puede reservar en el pasado"`. | `reports/CP-28_vitest.xml` |
| CP-29 | FRONT/AUTH/Unitaria | RBN-6 | Partición de equivalencia | Media | Renderizar `ProtectedRoute` sin autenticación. | Sin usuario en contexto/localStorage. | 1) Acceder a ruta protegida sin auth. | Redirige a `/login`. | `reports/CP-29_vitest.xml` |
| CP-30 | FRONT/AUTH/Unitaria | RBN-6 | Partición de equivalencia | Media | `RoleRoute` con roles permitidos. Usuario con rol no permitido. | Usuario autenticado rol `patient`, ruta requiere `admin`. | 1) Acceder a ruta con rol incorrecto. | Redirige a `roleHome` del rol del usuario. | `reports/CP-30_vitest.xml` |
| CP-31 | FRONT/AUTH/Unitaria | RF-AUTH-002 | Partición de equivalencia | Media | Usar `useAuth`. Key `clinic-angry.auth.user`. | Login exitoso simulado. | 1) Hacer login. 2) Verificar localStorage. 3) Recargar contexto. | 1) Usuario autenticado. 2) Guardado bajo `clinic-angry.auth.user`. 3) Sesión restaurada desde localStorage. | `reports/CP-31_vitest.xml` |
| CP-32 | FRONT/APP/Unitaria | RF-APP-009 / RBN-5 | Valores límite | Media | `CANCELLATION_HOURS = 24` en `frontend/src/lib/utils.ts`. | Fechas/hora para calcular si puede cancelar. | 1) >24h antes. 2) <24h antes. | 1) Puede cancelar. 2) No puede cancelar. | `reports/CP-32_vitest.xml` |

## 5. Matriz de Trazabilidad RF/RBN

| Requisito | Casos de Prueba | Técnica | Estado |
|---|---|---|---|
| RF-AUTH-001 | CP-01, CP-05 | Partición de equivalencia | Diseñado |
| RF-AUTH-002 | CP-02, CP-06, CP-08, CP-19, CP-26, CP-31 | Partición de equivalencia | Diseñado |
| RF-AUTH-003 | CP-03, CP-07 | Partición de equivalencia | Diseñado |
| RF-AUTH-005 | CP-04, CP-27 | Valores límite | Diseñado |
| RF-APP-001 | CP-20, CP-23, CP-28 | Tabla decisión/Partición | Diseñado |
| RF-APP-002 | CP-09, CP-18 | Partición de equivalencia | Diseñado |
| RF-APP-003 | CP-10, CP-11, CP-20, CP-28 | Valores límite/Tabla decisión | Diseñado |
| RF-APP-004 | CP-12, CP-20 | Partición de equivalencia/Tabla decisión | Diseñado |
| RF-APP-005 | CP-13, CP-20 | Tabla decisión | Diseñado |
| RF-APP-006 | CP-14, CP-20 | Tabla decisión | Diseñado |
| RF-APP-009 | CP-15, CP-16, CP-25, CP-32 | Valores límite | Diseñado |
| RF-APP-010 | CP-17, CP-21 | Transición de estados/Partición | Diseñado |
| RF-APP-011 | CP-17, CP-22 | Transición de estados/Partición | Diseñado |
| RF-APP-012 | CP-17, CP-22 | Transición de estados/Partición | Diseñado |
| RBN-1 | CP-10, CP-11, CP-20, CP-28 | Valores límite/Tabla decisión | Diseñado |
| RBN-2 | CP-12, CP-20 | Partición de equivalencia/Tabla decisión | Diseñado |
| RBN-3 | CP-13, CP-20 | Tabla decisión | Diseñado |
| RBN-4 | CP-14, CP-20 | Tabla decisión | Diseñado |
| RBN-5 | CP-15, CP-16, CP-25, CP-32 | Valores límite | Diseñado |
| RBN-6 | CP-19, CP-21, CP-22, CP-24, CP-29, CP-30 | Partición de equivalencia/Tabla decisión | Diseñado |

## 6. Datos, Fixtures y Seed

### Datos Fijos Exigidos
- **Reloj de referencia:** `2026-09-13`
- **Médicos de prueba:** `dra.ramos` (CMP-1001, Cardiología) y `dr.mendoza`, ambos del seed
- **Disponibilidad requerida:** `2026-09-16 09:00–12:00` activa para `dra.ramos` y `dr.mendoza` (el seed solo crea hoy y mañana: se crea en el fixture de integración)
- **Pacientes:** `paciente` (seed) y un segundo paciente creado en el fixture
- **Para RBN-4:** mismo paciente, mismo día/hora `2026-09-16 10:00`, con **otro médico disponible** (`dr.mendoza`)
- **Ventana cancelación:** `CANCELLATION_HOURS = 24`

### Seed Demo
Ubicación: `backend/apps/users/management/commands/seed_demo.py`  
Password demo: `ClinicaAngry1`  
Usuarios demo mostrados en frontend: `admin`, `recepcion`, `dra.ramos`, `paciente`  
Médicos en seed: Dra. Elena Ramos (`dra.ramos`, licencia `CMP-1001`, especialidad Cardiología, box B104).

### Estrategia de Datos
- **Unitarias:** Sin BD/servidor HTTP. Mockear dependencias con `unittest.mock` (Python) / `vi.mock` (Vitest).
- **Integración:** BD PostgreSQL aislada (Docker). Migraciones + seed antes de ejecución. Cada suite prepara/limpia sus datos.
- **Datos sintéticos:** Faker/factories cuando aplique, pero con valores fijos para casos límite.
- **Aislado:** Sin tocar datos de producción.

## 7. Metas de Cobertura

| Ámbito | Meta del plan de pruebas | Umbral actual en CI | Alcance medido |
|---|---|---|---|
| Backend crítico (AUTH + APP) | Líneas ≥ 85 %; ramas ≥ 75 % | `--cov-fail-under=80` (global) | `backend/apps/authentication/` (serializers y services), `backend/apps/appointments/services.py`, vistas y permisos (`backend/apps/users/permissions.py`) |
| Frontend crítico (AUTH + APP) | Líneas ≥ 80 % | **VERIFICAR** el umbral en la configuración de Vitest | `src/schemas`, `src/lib/utils.ts`, `src/features/layout/routeGuards.tsx` y el hook `useAuth` |

- **Brecha a cerrar:** el CI exige 80 % global, mientras que la meta del plan es 85 % sobre el código crítico. Se propone medir con `uv run pytest --cov=apps.authentication --cov=apps.appointments --cov-branch --cov-report=html` y subir el umbral a 85 % cuando se alcance.
- **Reportes:** `backend/htmlcov/` y `frontend/coverage/`, adjuntos como artefactos del workflow.
- **Exclusiones:** migraciones, settings, `__init__.py`, comando `seed_demo` y archivos de prueba.

## 8. Resumen de Distribución por Tipo y Módulo

| Tipo de prueba | AUTH | APP | Total |
|---|---|---|---|
| Unitarias backend | 3 (CP-01, CP-02, CP-04) | 10 (CP-09 a CP-18) | 13 |
| Integración (API + BD) | 6 (CP-03, CP-05, CP-06, CP-07, CP-08, CP-19) | 6 (CP-20, CP-21, CP-22, CP-23, CP-24, CP-25) | 12 |
| Unitarias frontend | 5 (CP-26, CP-27, CP-29, CP-30, CP-31) | 2 (CP-28, CP-32) | 7 |
| **Total** | **14** | **18** | **32** |

**Por técnica:** Partición de equivalencia: 19; Valores límite: 8; Tabla de decisión: 4; Transición de estados: 1.

**Por prioridad:** Alta: 21; Media: 9; Baja: 2.

**Por estrategia de integración:** Top-down: 4; Bottom-up: 4; Sándwich: 2; Big bang: 2.

## 9. Hallazgos

### Discrepancias de Contraseña
- **Documentación (`docs/03-REQUISITOS-FUNCIONALES.md`):** Indica RF-AUTH-005 como "contraseñas de, al menos, 8 caracteres".
- **Código real:** `backend/apps/authentication/serializers.py:25` usa `min_length=6` y `backend/apps/authentication/services.py:29-33` (`validate_password_strength`) exige **mínimo 6 caracteres + al menos una mayúscula + al menos un número**. Los mensajes reales son `"Debe incluir una letra mayúscula."` y `"Debe incluir un número."`.
- **Acción:** Los casos de prueba se basan en el **comportamiento real del código** (6 caracteres). Se requiere actualizar la documentación funcional para reflejar la política real.

### Ausencia de Playwright/E2E
- **Hallazgo:** No se encontraron archivos `*.spec.ts` ni configuración de Playwright (`playwright.config.*`) en el repositorio. El README menciona `tests/e2e` pero no existe. CI solo tiene jobs backend/frontend/integration.
- **Acción:** Confirmar existencia y comando real antes de ejecutar E2E. Si no existe, se considera **fuera de alcance** para este diseño.

### Diferencias entre Seed Real y Datos de los Casos
- **Usuarios demo:** Frontend muestra `admin`, `recepcion`, `dra.ramos`, `paciente`. Seed crea `admin`, `recepcion`, doctores con usernames `dra.ramos`, `dr.mendoza`, etc., y paciente `paciente`.
- **Médico CAR-001:** Los casos requieren médico con matrícula/licencia/código `CAR-001` y disponibilidad `2026-09-16 09:00–12:00`. En seed existe Dra. Elena Ramos con licencia `CMP-1001`. **No hay mapeo directo confirmado** entre `CAR-001` y registros del seed.
- **Disponibilidades:** Seed crea disponibilidades para `today` y `today+1` con estados ACTIVE/BLOCKED. Para fecha fija `2026-09-16` se requiere crear disponibilidad activa en fixtures de integración.
- **Reloj:** Casos usan fecha fija `2026-09-13`. Tests de integración deben mockear/controlar tiempo o usar fechas relativas al `today` del seed según estrategia definida.

- **Resolución:** los datos de los casos ya usan el seed real (`paciente`, `dra.ramos`, `dr.mendoza`, clave `ClinicaAngry1`). Se eliminó la referencia a `CAR-001`.

### RF/RBN Faltantes en Numeración
| RF/RBN | Estado en Código/Documentación | Observación |
|---|---|---|
| **RF-AUTH-004** | No encontrado | Ausente en `docs/03-REQUISITOS-FUNCIONALES.md` y sin implementación/uso identificado. No incluido en casos. |
| **RF-APP-007** | No encontrado | Ausente en documentación y código. No incluido en casos. |
| **RF-APP-008** | No encontrado | Ausente en documentación y código. No incluido en casos. |

**Nota sobre logout:** `auth/logout/` existe en `backend/apps/authentication/views.py` y `urls.py`. No está mapeado a un RF explícito en los listados revisados (RF-AUTH-001-003,005). Se cubre con **CP-07** como funcionalidad de integración verificada, pero **no corresponde a RF-AUTH-004** (no existe).

## 10. Supuestos y Puntos a VERIFICAR

### Críticos
- [ ] **Playwright/E2E:** Ausente. Confirmar existencia/comando o marcar fuera de alcance.
- [ ] **Fixture de disponibilidad:** crear disponibilidad activa el `2026-09-16` para `dra.ramos` y `dr.mendoza`, y confirmar la especialidad de `dr.mendoza`.
- [ ] **Disponibilidad 2026-09-16:** Seed usa fechas relativas. Crear disponibilidad activa para `2026-09-16` en setup de integración.
- [ ] **Política de contraseña:** Sincronizar `docs/03-REQUISITOS-FUNCIONALES.md` con comportamiento real (6 chars + mayúscula + número).

### Importantes
- [ ] **Mensajes exactos:** Verificados `services.py:49,58,67,86`. Confirmar mensaje completo de disponibilidad.
- [ ] **Formato error handler:** `{"detail":"Datos inválidos","fieldErrors":{...}}` según contexto.
- [ ] **Acciones citas:** POST a `/confirm/`, `/cancel/`, `/check_in/`, `/complete/`, `/no_show/` verificado.
- [ ] **Permisos:** `IsStaffRole` para acciones staff, autenticado para create/list/cancel con queryset filtrado.

### Notas de Implementación
- **Unitarias puras:** CP-01, CP-02, CP-04, CP-09-CP-18 usan mocks, sin servidor/BD.
- **Integración:** CP-03, CP-05, CP-06, CP-07, CP-08, CP-19-CP-25 requieren BD aislada con migraciones.
- **Frontend unitarias:** CP-26-CP-32 con Vitest + RTL, sin backend real.
- **Evidencia:** Para unitarias usar `reports/<CP-ID>_pytest.xml` o `reports/<CP-ID>_vitest.xml`. Para integración usar `reports/<CP-ID>_pytest_integration.xml`.
- **Sin modificar producción:** Solo documentación.
- **Basado en código real:** Todos los IDs, mensajes, rutas, reglas verificados contra código fuente.