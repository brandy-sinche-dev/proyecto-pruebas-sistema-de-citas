# Modelo de Datos — Clínica Angry

## 1. Entidades principales (apps Django)

### 1.1 Usuarios y roles

**`users.User`** (tabla `users_user`, AbstractUser)

| Campo | Tipo | Notas |
| --- | --- | --- |
| username/email | CharField | identificador de login |
| first_name / last_name | CharField | compone `full_name` |
| role | CharField(32) | `ADMIN`, `RECEPTIONIST`, `DOCTOR`, `PATIENT` |
| phone | CharField(32) | default "" |

Restricción: check `role` en lista válida (`users_user_role_valid`).

### 1.2 Catálogos

**`specialties.Specialty`** (`specialties_specialty`): `name` (único), `description`, `color`, `icon`, `fee` (DecimalField 10,2).

**`finances.Insurance`** (`finances_insurance`): `code` (único), `name`, `coverage_percent` (0–100, check `finances_insurance_coverage_max`), `active`.

### 1.3 Perfiles

**`patients.PatientProfile`** (`patients_patientprofile`, 1:1 con User):
`document_number`, `birth_date`, `gender` (M/F, check `patients_gender_valid`), `blood_type`, `insurance` (FK `finances.Insurance` nullable), `policy_number`, `medical_history` (JSON).

**`doctors.DoctorProfile`** (`doctors_doctorprofile`, 1:1 con User):
`specialty` (FK `Specialty`), `license_number` (único), `box` (strings), `available` (bool).

### 1.4 Operación

**`schedules.Availability`** (`schedules_availability`):
`doctor` (FK `DoctorProfile`), `date`, `start_time`, `end_time`, `status` (`ACTIVE`, `BLOCKED`, `PAST`), `box`.
Restricciones: `UniqueConstraint(doctor, date)` (`schedules_doctor_date_unique`) y check `start_time < end_time` (`schedules_time_range_valid`).

**`boxes.Box`** (`boxes_box`): `code` (único), `name`, `area`, `floor`, `status` (`FREE`, `IN_USE`, `MAINTENANCE`, `DISINFECTION`), `doctor` (FK nullable), `active`.

**`appointments.Appointment`** (`appointments_appointment`):
`code` (único, código secuencial por fecha), `patient` (FK `PatientProfile`, PROTECT), `doctor` (FK `DoctorProfile`, PROTECT), `specialty` (FK `Specialty`, PROTECT), `date`, `start_time`, `end_time` (se completa con `CONSULTATION_DURATION_MINUTES`, default 30 min), `status`, `box`, `reason`, `notes`, `teleconsult` (bool) + `teleconsult_link`, `created_at`, `updated_at`.
Índices: `(doctor,date)`, `(patient,date)`, `(status)`.

### 1.5 Atención clínica (`appointments`)

| Entidad | Tabla | Campos clave |
| --- | --- | --- |
| `Medication` | `appointments_medication` | name, dosage, frequency, duration |
| `Prescription` | `appointments_prescription` | code único, appointment (FK), medications (M2M), instructions, notes |
| `ConsultationNote` | `appointments_consultationnote` | appointment (FK), diagnosis, treatment, notes |
| `ClinicalExam` | `appointments_clinicalexam` | appointment (FK), category (`LABORATORY`/`IMAGING`/`OTHER`), name, result, reference_range, status (`PENDING`/`PROCESSING`/`COMPLETED`), performed_at |

### 1.6 Facturación (`finances`)

**`finances.Billing`** (`finances_billing`): `code` único anual, `appointment` (1:1, PROTECT), `insurance` (FK nullable), `gross_amount`, `insurance_amount`, `copay_amount`, `payment_method` (`CASH`/`WEB`/`POS`), `status` (`PENDING`/`PAID`/`SETTLED`/`GLOSA`).

### 1.7 Transversal

| Entidad | Tabla | Campos |
| --- | --- | --- |
| `notifications.Notification` | `notifications_notification` | user (FK), message, read, created_at |
| `audit.AuditLog` | `audit_auditlog` | user (FK nullable), action, module, method, path, status_code, metadata (JSON), created_at; índice `(module, action)` |

## 2. Diagrama de relaciones (ER)

```
┌─────────┐  1:1   ┌──────────────────┐
│  User   │◄───────│ PatientProfile   │── insurance ──► Insurance
└────┬────┘        └──────────────────┘
     │ 1:1
┌────▼────────┐ specialidad ┌────────────┐        ┌──────────┐
│ DoctorProfile│────────────►│ Specialty  │◄───────┤ Box      │
└────┬────────┘             └────────────┘        └─────┬────┘
     │ doctor                                             │
┌────▼───────────────────┐                              │
│  Availability          │ `UniqueConstraint(doctor,date)`
└────▲───────────────────┘                              │
     │                                                   │
┌────┴────────────┐   patient      ┌──────────────────┐  │
│  Appointment     ├──────────────►│ PatientProfile    │
│ code, date, slot │               └──────────────────┘
│ status, teleconsult│── doctor ──► DoctorProfile ─────► Box (FK optional)
└────┬────────────┘
     ├── 1:1 ──► Billing ── insurance ──► Insurance
     ├── 1:N ──► ConsultationNote
     ├── 1:N ──► Prescription ── M2M ──► Medication
     └── 1:N ──► ClinicalExam

User ──1:N──► Notification
User ◄──(nullable)── AuditLog
```

## 3. Enumerados

| Dominio | Valores |
| --- | --- |
| `Role` | `ADMIN`, `RECEPTIONIST`, `DOCTOR`, `PATIENT` |
| `AppointmentStatus` | `PENDING`, `CONFIRMED`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `AvailabilityStatus` | `ACTIVE`, `BLOCKED`, `PAST` |
| `BoxStatus` | `FREE`, `IN_USE`, `MAINTENANCE`, `DISINFECTION` |
| `ExamCategory` | `LABORATORY`, `IMAGING`, `OTHER` |
| `ExamStatus` | `PENDING`, `PROCESSING`, `COMPLETED` |
| `PaymentMethod` | `CASH`, `WEB`, `POS` |
| `BillingStatus` | `PENDING`, `PAID`, `SETTLED`, `GLOSA` |

## 4. Reglas de integridad clave

- `UniqueConstraint(doctor, date)` en `Availability` → una disponibilidad por médico/fecha (RBN-2).
- Check `start_time < end_time` en `Availability`.
- Check `0 ≤ coverage_percent ≤ 100` en `Insurance`.
- Check `gender ∈ {M, F, ""}` en `PatientProfile`.
- `license_number` y `code` de consultorios únicos.
- Códigos generados (`Appointment.code`, `Billing.code`, `Prescription.code`) únicos y no editables.

## 5. Nota sobre persistencia y pruebas

- La BD de referencia es **PostgreSQL 16** (Docker). Las pruebas de integración validan la persistencia real (login, reserva, conflicto de slot, cancelación).
- El seed (`manage.py seed_demo`) es idempotente y crea usuarios demo por rol.