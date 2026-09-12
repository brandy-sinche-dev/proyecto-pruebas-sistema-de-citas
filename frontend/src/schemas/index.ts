import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'El nombre es obligatorio'),
    lastName: z.string().min(2, 'El apellido es obligatorio'),
    email: z.string().email('Correo no válido'),
    username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .regex(/[A-Z]/, 'Debe incluir una letra mayúscula')
      .regex(/[0-9]/, 'Debe incluir un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export const appointmentSchema = z
  .object({
    specialtyId: z.coerce.number().int().positive('Selecciona una especialidad'),
    doctorId: z.coerce.number().int().positive('Selecciona un médico'),
    date: z.string().min(1, 'Selecciona una fecha'),
    startTime: z.string().min(1, 'Selecciona una hora'),
    reason: z.string().max(300, 'Máximo 300 caracteres').optional(),
  })
  .superRefine((data, ctx) => {
    const slot = new Date(`${data.date}T${data.startTime}`)
    const now = new Date()
    const minutes = (slot.getTime() - now.getTime()) / 60_000
    if (minutes < 0) {
      ctx.addIssue({ code: 'custom', path: ['startTime'], message: 'No se puede reservar en el pasado' })
    }
  })

export type AppointmentFormValues = z.infer<typeof appointmentSchema>

export const availabilitySchema = z.object({
  date: z.string().min(1, 'Selecciona una fecha'),
  startTime: z.string().min(1, 'Selecciona la hora de inicio'),
  endTime: z.string().min(1, 'Selecciona la hora de fin'),
}).refine((data) => data.endTime > data.startTime, {
  message: 'La hora de fin debe ser posterior a la de inicio',
  path: ['endTime'],
})

export type AvailabilityFormValues = z.infer<typeof availabilitySchema>

export const profileSchema = z.object({
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  email: z.string().email('Correo no válido'),
  phone: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>