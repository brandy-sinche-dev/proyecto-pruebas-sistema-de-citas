# Historias de Usuario — Clínica Angry

Historias de usuario (HU) con formato **"Como [rol], quiero [acción], para [beneficio]"**, criterios de aceptación (C.A.) y prioridad MoSCoW. Se vinculan a los RF de [Requisitos funcionales](./03-REQUISITOS-FUNCIONALES.md) y al [Backlog de producto](./08-BACKLOG-DE-PRODUCTO.md).

## HU-PAC — Paciente

### HU-PAC-001 | Registro de paciente
Como **paciente**, quiero **registrarme con mi email y contraseña**, para **poder reservar citas en línea**.

C.A.:
- El formulario valida formato de email y contraseña mínima de 8 caracteres.
- Con email duplicado, la API responde 400 con mensaje claro y no se crea el usuario.
- Al registrarse, el usuario queda con rol `PATIENT` y puede iniciar sesión.
- El registro es persistido en PostgreSQL (integración).

### HU-PAC-002 | Iniciar / cerrar sesión
Como **paciente**, quiero **iniciar y cerrar sesión**, para **acceder a mis citas de forma segura**.

C.A.:
- Login válido devuelve `access` y `refresh` tokens (JWT).
- Login inválido responde 401 sin indicar si falló el email o la contraseña.
- El refresh token renueva el access token sin reingresar credenciales.
- Al cerrar sesión, el token se invalida y se redirige a login.

### HU-PAC-003 | Ver y editar perfil
Como **paciente**, quiero **ver y editar mis datos**, para **mantener mi información actualizada**.

C.A.:
- Muestra nombre, apellido, email, teléfono y datos demográficos (documento, nacimiento, género).
- Guarda cambios con validaciones y actualiza el registro.
- Un paciente no puede editar el perfil de otro usuario (403).

### HU-PAC-004 | Explorar especialidades y médicos
Como **paciente**, quiero **ver especialidades y buscar médicos**, para **elegir a mi profesional**.

C.A.:
- Lista especialidades con arancel (fee) y médicoa asociados.
- Permite filtrar médicos por especialidad.
- Solo muestra médicos disponibles (doctor `available=true`) y con disponibilidad futura.

### HU-PAC-005 | Consultar disponibilidad
Como **paciente**, quiero **consultar la disponibilidad de un médico**, para **saber qué horarios puedo reservar**.

C.A.:
- Muestra solo fechas con disponibilidad `ACTIVE` y posteriores a hoy.
- No muestra slots pasados ni bloqueados.

### HU-PAC-006 | Reservar cita
Como **paciente**, quiero **reservar una cita dentro de la disponibilidad**, para **asegurar mi atención**.

C.A.:
- La reserva genera un **código único** y estado `PENDING`.
- No se reserva en el pasado (RBN-1).
- No se reserva fuera de la disponibilidad del médico (RBN-2).
- No se acepta el mismo slot para el mismo médico (RBN-3) → 409/400.
- El paciente no puede tener dos citas simultáneas (RBN-4).
- Soporta cita presencial o teleconsulta (con enlace).

### HU-PAC-007 | Ver próximas citas e historial
Como **paciente**, quiero **ver mis citas próximas y mi historial**, para **recordar mis atenciones**.

C.A.:
- Lista citas ordenadas por fecha/hora con su estado en **badge** de color.
- Separa próximas (activas) y pasadas (historial).
- Un paciente solo ve **sus** citas (RBAC).

### HU-PAC-008 | Cancelar cita
Como **paciente**, quiero **cancelar una cita dentro de la ventana**, para **liberar el turno**.

C.A.:
- La cancelación respeta la ventana configurable (`CANCEL_WINDOW_HOURS`) (RBN-5).
- Fuera de la ventana, la API rechaza la cancelación con mensaje claro.
- La cita pasa a `CANCELLED` y se genera notificación/auditoría.
- Se solicita confirmación en la UI (diálogo).

### HU-PAC-009 | Ver mis notificaciones
Como **paciente**, quiero **ver notificaciones del sistema**, para **estar al tanto de confirmaciones y cambios**.

C.A.:
- Lista notificaciones ordenadas por fecha.
- Puede marcarlas como leídas.
- Se genera notificación al confirmar/cancelar una cita.

## HU-DOC — Médico

### HU-DOC-001 | Ver perfil profesional
Como **médico**, quiero **ver mi perfil profesional**, para **verificar mis datos y especialidad**.

C.A.:
- Muestra especialidad, matrícula y consultorio asignado.
- Solo el propio médico ve su perfil completo.

### HU-DOC-002 | Gestionar disponibilidad
Como **médico**, quiero **registrar y gestionar mi disponibilidad**, para **definir qué horarios atiendo**.

C.A.:
- Registrar disponibilidad por fecha con inicio y fin, estado `ACTIVE`.
- No se permite duplicar la misma fecha para el mismo médico (unique).
- Requiere `start_time < end_time`.
- **Solo el médico propietario** modifica su disponibilidad (RBN-7) → 403 para otros.
- Estado `BLOCKED` bloquea el horario sin eliminar el registro.

### HU-DOC-003 | Ver agenda del día
Como **médico**, quiero **ver mi agenda diaria**, para **organizar mi atención**.

C.A.:
- Muestra citas del día ordenadas por hora con estado.
- Permite filtrar por fecha.
- Solo muestra citas del médico autenticado.

### HU-DOC-004 | Confirmar / rechazar citas
Como **médico**, quiero **confirmar o rechazar citas pendientes**, para **gestionar mi disponibilidad real**.

C.A.:
- `PENDING → CONFIRMED` confirma; `PENDING → CANCELLED` rechaza.
- Solo médicos del doctor de la cita (o admin/recepción autorizados) pueden transicionar.
- La transición registra motivo y deja auditoría.

### HU-DOC-005 | Registrar atención (check-in/atendida)
Como **médico**, quiero **marcar la cita como ingresada y atendida**, para **registrar el resultado de la consulta**.

C.A.:
- `CONFIRMED → CHECKED_IN` (recepción) y `CHECKED_IN → COMPLETED` (médico).
- `CONFIRMED → NO_SHOW` cuando el paciente no se presentó.
- Solo se admiten transiciones según la máquina de estados (RBN-9).

### HU-DOC-006 | Notas de consulta y recetas
Como **médico**, quiero **registrar notas, recetas y exámenes**, para **dejar constancia clínica de la atención**.

C.A.:
- Crear `ConsultationNote` vinculada a la cita (diagnóstico, tratamiento, observaciones).
- Crear `Prescription` con medicamentos (nombre, dosis, frecuencia, duración) e instrucciones.
- Solicitar `ClinicalExam` con categoría (LABORATORY/IMAGING/OTHER) y estado inicial `PENDING`.
- Solo el médico de la cita edita la atención (RBAC).

### HU-DOC-007 | Registrar pacientes de consultorio
Como **médico**, quiero **ver los pacientes de mi consultorio en el día**, para **preparar la atención**.

C.A.:
- Muestra pacientes con cita del día en el box del médico.
- Indica estado de la cita y datos de contacto.

## HU-REC — Recepción

### HU-REC-001 | Dashboard de recepción
Como **recepción**, quiero **ver las citas del día**, para **atender a los pacientes que llegan**.

C.A.:
- Muestra citas del día por estado (pendientes, confirmadas, en curso).
- Permite buscar por paciente o código de cita.

### HU-REC-002 | Check-in de pacientes
Como **recepción**, quiero **registrar el ingreso del paciente**, para **iniciar su atención**.

C.A.:
- `CONFIRMED → CHECKED_IN` al llegar el paciente.
- Solo se permite desde estado confirmado.
- Queda registrado en auditoría.

### HU-REC-003 | Gestionar pacientes y médicos
Como **recepción**, quiero **crear y actualizar pacientes y médicos**, para **mantener la base de datos actualizada**.

C.A.:
- Registro de paciente con datos demográficos.
- Edición de médicos (solo catálogo, no permisos).
- Validación de documento y campos obligatorios.

### HU-REC-004 | Gestionar citas del mostrador
Como **recepción**, quiero **reservar/cancelar citas en nombre del paciente**, para **ayudar a pacientes sin acceso digital**.

C.A.:
- Aplica las mismas reglas de negocio que la reserva online (RBN-1 a RBN-5).
- Puede cancelar citas dentro de la ventana.

## HU-ADM — Administración

### HU-ADM-001 | Dashboard administrativo
Como **administrador**, quiero **ver métricas de la operación**, para **tomar decisiones**.

C.A.:
- KPIs: citas del día, por estado, por especialidad, ingresos estimados.
- Datos agregados del endpoint `dashboard/summary/`.
- Acceso restringido a rol `ADMIN`.

### HU-ADM-002 | Gestionar médicos
Como **administrador**, quiero **gestionar médicos y su asignación**, para **mantener la oferta médica**.

C.A.:
- Crear/editar médico: especialidad, matrícula única, consultorio, activo.
- Desactivar médico (baja lógica) sin eliminar su historial.
- RBAC: solo admin gestiona todos los médicos (RBN-8).

### HU-ADM-003 | Gestionar especialidades
Como **administrador**, quiero **gestionar especialidades y aranceles**, para **mantener el catálogo**.

C.A.:
- Crear/editar con nombre único, descripción, color, icono y fee.
- Desactivar especialidades con citas históricas sin borrar datos.

### HU-ADM-004 | Gestionar consultorios
Como **administrador**, quiero **gestionar consultorios**, para **controlar la infraestructura física**.

C.A.:
- CRUD de boxes: código único, nombre, área, piso, estado y médico asignado.
- Estados: `FREE`, `IN_USE`, `MAINTENANCE`, `DISINFECTION`.

### HU-ADM-005 | Gestionar horarios de todo el staff
Como **administrador**, quiero **ver y ajustar la disponibilidad de todos los médicos**, para **cubrir turnos**.

C.A.:
- Ver disponibilidad por médico y fecha.
- Crear/editar disponibilidad de cualquier médico (RBN-8 complemento RF-SCH-006).

### HU-ADM-006 | Gestionar citas
Como **administrador**, quiero **ver y gestionar todas las citas**, para **resolver conflictos y soporte**.

C.A.:
- Lista global con filtros por fecha, médico, paciente y estado.
- Puede cancelar/transicionar citas respetando la máquina de estados.
- Ve auditoría de cambios de la cita.

### HU-ADM-007 | Auditoría
Como **administrador**, quiero **consultar los registros de auditoría**, para **verificar quién hizo qué y cuándo**.

C.A.:
- Lista `AuditLog` con usuario, acción, módulo, método, ruta, status y fecha.
- Filtros por módulo/acción.
- Acceso restringido a rol `ADMIN`.

## HU-AUTH — Autenticación transversal

### HU-AUTH-001 | Guard de rol
Como **usuario autenticado**, quiero **que las rutas respeten mi rol**, para **no acceder a funciones que no me corresponden**.

C.A.:
- Un paciente no accede a rutas de médico/admin/recepción (redirección).
- La API responde 403 ante intentos no autorizados.
- Cubierto por tests de frontend (`routeGuards`) y de backend (permisos).

### HU-AUTH-002 | Recuperación de contraseña (UI base)
Como **usuario**, quiero **solicitar recuperar mi contraseña**, para **volver a acceder**.

C.A.:
- Formulario de recuperación con validación de email.
- Flujo UI base; el envío real de correos queda fuera de alcance v1.

> **Nota**: las hu de testing y calidad se detallan en [Requisitos no funcionales](./04-REQUISITOS-NO-FUNCIONALES.md) y en el [Plan de implementación](#) del repositorio (`skills/09-PLAN-DE-IMPLEMENTACION.md`).