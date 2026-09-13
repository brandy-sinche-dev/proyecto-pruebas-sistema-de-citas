# Requisitos Funcionales — Clínica Angry

Documento de requisitos funcionales (RF) del Sistema de Gestión de Citas Médicas. Codificados por módulo, con prioridad MoSCoW (**M**ust / **S**hould / **C**ould / **W**on't) y trazabilidad hacia [Historias de usuario](./05-HISTORIAS-DE-USUARIO.md).

## 1. Roles del sistema

| Rol | Código | Descripción |
| --- | --- | --- |
| Paciente | `PATIENT` | Se registra y gestiona sus citas e historial |
| Médico | `DOCTOR` | Gestiona disponibilidad, agenda y atención clínica |
| Recepción | `RECEPTIONIST` | Opera citas, pacientes y médicos en mostrador |
| Administración | `ADMIN` | Gestiona catálogos, operación, auditoría y métricas |

## 2. Matriz de módulos

| Módulo | Código | Descripción |
| --- | --- | --- |
| Autenticación | `AUTH` | Registro, login, refresh, logout, recuperación de contraseña |
| Usuarios | `USER` | Perfiles y roles |
| Especialidades | `SPEC` | Catálogo de especialidades, aranceles, color/icono |
| Médicos | `DOC` | Perfil profesional, matrícula, consultorio |
| Pacientes | `PAT` | Historia demográfica y clínica básica |
| Disponibilidad | `SCH` | Horarios de atención por médico/consultorio |
| Citas | `APP` | Reserva, confirmación, check-in, atención, cancelación |
| Atención clínica | `CLI` | Notas de consulta, recetas, exámenes |
| Consultorios | `BOX` | Gestión física de consultorios |
| Facturación | `FIN` | Liquidaciones y medios de pago |
| Notificaciones | `NOT` | Avisos internos al usuario |
| Auditoría | `AUD` | Registro de acciones del sistema |
| Dashboard | `DASH` | Métricas operativas por rol |

## 3. Requisitos por módulo

### 3.1 Autenticación (`AUTH`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-AUTH-001 | El sistema debe permitir registrarse como paciente con nombre, apellido, email (usuario), contraseña y teléfono. | M |
| RF-AUTH-002 | El sistema debe iniciar sesión validando credenciales y emitir tokens JWT (access + refresh). | M |
| RF-AUTH-003 | El sistema debe permitir renovar el access token mediante el refresh token. | M |
| RF-AUTH-004 | El sistema debe permitir cerrar sesión invalidando el token. | M |
| RF-AUTH-005 | El sistema debe exigir contraseñas de, al menos, 8 caracteres. | M |
| RF-AUTH-006 | El sistema debe mostrar mensajes de error claros ante credenciales inválidas (anteriore al estado "Cuenta bloqueada"). | S |
| RF-AUTH-007 | El sistema debe permitir al usuario solicitar recuperación de contraseña (flujo UI básico). | S |

### 3.2 Usuarios y perfiles (`USER`, `PAT`, `DOC`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-USER-001 | El sistema debe permitir ver y editar el perfil propio (datos personales, teléfono). | M |
| RF-PAT-001 | El paciente debe registrar datos demográficos: documento, fecha de nacimiento, género, tipo de sangre. | S |
| RF-PAT-002 | El paciente debe poder asociar una aseguradora y número de póliza para su historial clínico. | C |
| RF-DOC-001 | El administrador debe poder crear/editar médicos asignando especialidad, matrícula, consultorio y estado disponible. | M |
| RF-DOC-002 | El médico debe poder ver su perfil profesional y sus datos de contacto. | M |

### 3.3 Especialidades (`SPEC`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-SPEC-001 | El sistema debe listar especialidades con nombre, descripción, color, icono y arancel (fee). | M |
| RF-SPEC-002 | El administrador debe poder crear, editar y desactivar especialidades. | M |
| RF-SPEC-003 | Los aranceles se gestionan como valor decimal en la especialidad. | S |

### 3.4 Disponibilidad (`SCH`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-SCH-001 | El médico debe poder registrar su disponibilidad por fecha con hora inicio y fin. | M |
| RF-SCH-002 | Solo debe existir **una** disponibilidad activa por médico y fecha (unique doctor+date). | M |
| RF-SCH-003 | La disponibilidad debe tener estado: `ACTIVE` (disponible), `BLOCKED` (bloqueado) o `PAST` (pasado). | M |
| RF-SCH-004 | El rango de tiempo debe ser válido: hora inicio < hora fin. | M |
| RF-SCH-005 | Un médico solo puede modificar **su propia** disponibilidad. | M |
| RF-SCH-006 | El administrador puede gestionar disponibilidad de cualquier médico. | M |

### 3.5 Citas (`APP`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-APP-001 | El paciente debe poder reservar una cita eligiendo especialidad, médico, fecha dentro de la disponibilidad y hora. | M |
| RF-APP-002 | El sistema debe generar un **código único** de cita. | M |
| RF-APP-003 | No se puede reservar en el pasado. | M |
| RF-APP-004 | No se puede reservar fuera del rango de disponibilidad del médico. | M |
| RF-APP-005 | No se permiten dos citas activas que ocupen el mismo slot para el mismo médico. | M |
| RF-APP-006 | Un paciente no puede tener dos citas simultáneas. | M |
| RF-APP-007 | La cita puede ser presencial o por **teleconsulta** (con enlace). | S |
| RF-APP-008 | El paciente debe poder ver sus próximas citas y su historial. | M |
| RF-APP-009 | La cancelación debe respetar una ventana configurable (`CANCEL_WINDOW_HOURS`). | M |
| RF-APP-010 | El médico debe poder confirmar o rechazar/cancelar citas pendientes. | M |
| RF-APP-011 | El médico debe poder marcar asistencia: atendida, no asistió. | M |
| RF-APP-012 | Recepción debe poder realizar el **check-in** de la cita al llegar el paciente. | M |
| RF-APP-013 | Los estados siguen la máquina de estados definida en el §4. | M |
| RF-APP-014 | Las transiciones de estado deben registrarse con motivo (cancelación/rechazo). | S |

### 3.6 Atención clínica (`CLI`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-CLI-001 | El médico debe registrar **notas de consulta** (diagnóstico, tratamiento, observaciones) vinculadas a una cita. | S |
| RF-CLI-002 | El médico debe poder emitir **recetas** con medicamentos (nombre, dosis, frecuencia, duración) e instrucciones. | S |
| RF-CLI-003 | El médico debe poder solicitar **exámenes** (laboratorio clínico, imágenes) y registrar resultados y estado. | C |
| RF-CLI-004 | El paciente debe poder consultar su historial de citas y resultados disponibles. | S |

### 3.7 Consultorios (`BOX`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-BOX-001 | El administrador debe gestionar consultorios: código, nombre, área, piso, estado y médico asignado. | S |
| RF-BOX-002 | El estado de un consultorio debe ser `FREE`, `IN_USE`, `MAINTENANCE` o `DISINFECTION`. | S |
| RF-BOX-003 | Un consultorio puede desactivarse (baja lógica). | C |

### 3.8 Facturación (`FIN`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-FIN-001 | Cada cita atendida debe generar una **liquidación** con monto bruto, cobertura aseguradora y copago. | S |
| RF-FIN-002 | El sistema debe registrar el medio de pago: `CASH`, `POS`, `WEB`. | S |
| RF-FIN-003 | El estado de la liquidación es `PENDING`, `PAID`, `SETTLED` o `GLOSA`. | S |
| RF-FIN-004 | El administrador debe gestionar aseguradoras (código, nombre, % de cobertura). | C |
| RF-FIN-005 | La cobertura porcentual de una aseguradora no debe superar 100 %. | M |

### 3.9 Notificaciones (`NOT`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-NOT-001 | El sistema debe crear una notificación interna al paciente al confirmar/cancelar una cita. | S |
| RF-NOT-002 | El usuario debe poder ver y marcar notificaciones como leídas. | C |

### 3.10 Auditoría (`AUD`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-AUD-001 | El sistema debe registrar cada transición de cita y acción sensible (acción, módulo, método, ruta, código de estado, metadata, usuario, fecha). | M |
| RF-AUD-002 | El administrador debe poder consultar el log de auditoría filtrado por módulo/acción. | S |

### 3.11 Dashboard (`DASH`)

| ID | Requisito | Prioridad |
| --- | --- | --- |
| RF-DASH-001 | El sistema debe mostrar métricas: citas del día, por estado, por especialidad, ingresos estimados. | S |
| RF-DASH-002 | Cada rol ve un dashboard acorde a su operación (paciente, médico, recepción, administración). | M |

## 4. Reglas de negocio y máquina de estados de la cita

Estados de cita: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.

```
PENDING    → CONFIRMED   (médico/recepción confirma)
PENDING    → CANCELLED   (paciente/médico/recepción dentro de ventana)
CONFIRMED  → CHECKED_IN  (recepción registra llegada del paciente)
CONFIRMED  → CANCELLED   (dentro de ventana configurable)
CONFIRMED  → NO_SHOW     (no se presentó)
CHECKED_IN → COMPLETED   (atención finalizada)
```

Reglas transversales:

1. **RBN-1**: No se puede reservar en el pasado.
2. **RBN-2**: La cita debe caer dentro de la disponibilidad del médico (fecha y rango horario).
3. **RBN-3**: No hay dos citas activas en el mismo slot para un mismo médico.
4. **RBN-4**: Un paciente no tiene dos citas simultáneas.
5. **RBN-5**: La cancelación respeta la ventana configurada (`CANCEL_WINDOW_HOURS`).
6. **RBN-6**: Solo usuarios autorizados acceden a recursos protegidos (guard por rol).
7. **RBN-7**: Un médico solo gestiona su propia disponibilidad.
8. **RBN-8**: El administrador gestiona todos los recursos.
9. **RBN-9**: Las transiciones de estado de cita deben respetar la máquina de estados.
10. **RBN-10**: Todas las reglas se validan en backend (la UI solo es una capa adicional).

## 5. Formularios y validaciones base

| Campo | Validación |
| --- | --- |
| email (username) | Formato de email válido; único |
| contraseña | Mínimo 8 caracteres |
| fecha de cita | Debe ser ≥ fecha actual |
| rango de disponibilidad | `start_time < end_time` |
| cobertura aseguradora | `0 ≤ coverage_percent ≤ 100` |
| slot de cita | Sin solapamiento de médicos ni doble cita del paciente |

## 6. Trazabilidad RF ↔ HU

Cada RF se implementa y verifica a través de al menos una [Historia de usuario](./05-HISTORIAS-DE-USUARIO.md). La trazabilidad completa se mantiene en el [Backlog de producto](./08-BACKLOG-DE-PRODUCTO.md).