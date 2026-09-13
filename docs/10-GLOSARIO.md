# Glosario — Clínica Angry

Términos del dominio usados en la documentación, el código y las pruebas del sistema. Coherentes con las apps Django y con los términos del frontend.

| Término | Descripción |
| --- | --- |
| **Cita (Appointment)** | Reserva de atención médica para una fecha y slot horario, definido por paciente, médico y especialidad. |
| **Slot** | Intervalo horario puntual (inicio, fin; duración por defecto 30 min) dentro de la disponibilidad del médico. |
| **Disponibilidad (Availability)** | Rango horario en el que un médico atiende en una fecha determinada. Una fecha por médico (unique). |
| **Estado de cita** | `PENDING`, `CONFIRMED`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`, `NO_SHOW`. |
| **Check-in** | Registro de llegada del paciente (recepción) para iniciar la atención. |
| **No-show** | Paciente que no se presentó a una cita confirmada. |
| **Ventana de cancelación** | Horas mínimas restantes (`CANCEL_WINDOW_HOURS`) para permitir cancelar una cita. |
| **Consulta presencial** | Atención en un consultorio físico de la clínica. |
| **Teleconsulta** | Cita virtual con enlace generado (`teleconsult_link`), indicada por `teleconsult=true`. |
| **Especialidad (Specialty)** | Rama médica del catálogo con arancel (fee), color e icono. |
| **Médico (DoctorProfile)** | Profesional con matrícula, especialidad, consultorio y estado disponible. |
| **Paciente (PatientProfile)** | Usuario con datos demográficos (documento, nacimiento, género, sangre), aseguradora y póliza. |
| **Aseguradora (Insurance)** | Entidad con la que se financia parte de la consulta (porcentaje de cobertura). |
| **Consultorio (Box)** | Espacio físico con código, área/piso y estado operacional (libre, en uso, mantenimiento, desinfección). |
| **Liquidación (Billing)** | Documento económico de una cita: bruto, cobertura, copago, medio de pago y estado. |
| **Copago** | Monto que paga el paciente tras la cobertura de la aseguradora. |
| **Receta (Prescription)** | Documento clínico con medicamentos, instrucciones y observaciones. |
| **Nota de consulta (ConsultationNote)** | Registro clínico: diagnóstico, tratamiento y observaciones de una atención. |
| **Examen clínico (ClinicalExam)** | Estudio/laboratorio solicitado: laboratorio clínico, imágenes u otros, con estado y resultado. |
| **Auditoría (AuditLog)** | Trazabilidad de acciones (acción, módulo, método, ruta, status, metadata, usuario/fecha). |
| **Notificación** | Aviso interno al usuario (confirmación, cancelación, cambios). |
| **JWT** | Token de sesión (access/refresh) usado para autenticación de la API. |
| **API REST** | Interfaz de backend bajo `/api/v1/` con formato JSON. |
| **Health endpoint** | Recurso `/api/v1/health/` que reporta estado del backend y de la BD. |
| **Seed (`seed_demo`)** | Comando Django que carga usuarios y datos demo artificiales (idempotente). |
| **Monorepo** | Repositorio único que contiene backend, frontend y pruebas E2E. |
| **MoSCoW** | Técnica de priorización: Must / Should / Could / Won't. |
| **DoR / DoD** | Definition of Ready / Definition of Done: criterios de entrada de un ítem al sprint y de salida como terminado. |
| **RBN** | Reglas de negocio críticas (RBN-1 a RBN-10) que deben validarse en backend. |
| **Sprint 0** | Sprint de planificación y análisis; no entrega funcionalidad. Produce planificación, arquitectura, requisitos y HU. |