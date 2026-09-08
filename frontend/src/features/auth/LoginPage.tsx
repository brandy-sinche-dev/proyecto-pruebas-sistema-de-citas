import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { toDisplayError } from '@/services'
import { loginSchema, type LoginFormValues } from '@/schemas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertBanner } from '@/components/ui/Feedback'
import { roleHome } from '@/features/layout/navigation'

const demoUsers = [
  { role: 'Administrador', username: 'admin', icon: 'shield_person' },
  { role: 'Recepcionista', username: 'recepcion', icon: 'support_agent' },
  { role: 'Médico', username: 'dra.ramos', icon: 'stethoscope' },
  { role: 'Paciente', username: 'paciente', icon: 'person' },
]

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (isAuthenticated && user) return <Navigate to={roleHome[user.role]} replace />

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    try {
      const user = await login(values)
      navigate(roleHome[user.role])
    } catch (err) {
      setError(toDisplayError(err))
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-display text-xl font-bold text-on-secondary">
            A
          </span>
          <div>
            <p className="font-display text-xl font-bold text-white">Clínica Angry</p>
            <p className="text-xs text-secondary">Sistema de Gestión de Citas Médicas</p>
          </div>
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-tight font-bold text-white">
            Gestión de citas médicas con rigor clínico
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Plataforma integral para pacientes, médicos, recepción y administración. Sistema preparado para pruebas
            de software: unitarias, integración, API, E2E y cobertura.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60">
            <span className="material-symbols-outlined text-sm text-secondary">verified</span>
            Sede Central · San Isidro · Disponibilidad en tiempo real
          </div>
        </div>
        <p className="text-xs text-white/40">© 2025 Clínica Angry — Proyecto de Pruebas de Software</p>
      </section>

      <section className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-xl font-bold text-white">
              A
            </span>
            <p className="mt-3 font-display text-2xl font-bold text-primary">Clínica Angry</p>
          </div>

          <h2 className="font-display text-2xl font-bold text-primary">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Ingresa con tus credenciales institucionales</p>

          {error && (
            <div className="mt-4">
              <AlertBanner variant="error">{error}</AlertBanner>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            <Input
              label="Usuario"
              placeholder="nombre.usuario"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-400" defaultChecked />
                Recordarme
              </label>
              <Link to="/recuperar" className="text-sm font-medium text-secondary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-surface-container-lowest p-4">
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-outline">
              Cuentas de demostración (API real)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {demoUsers.map((demo) => (
                <button
                  key={demo.username}
                  type="button"
                  onClick={() => {
                    setValue('username', demo.username)
                    setValue('password', 'ClinicaAngry1')
                  }}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-surface-bright px-3 py-2 text-xs text-on-surface hover:border-secondary hover:bg-success-50"
                >
                  <span className="material-symbols-outlined text-base text-secondary">{demo.icon}</span>
                  <span className="text-left">
                    <span className="block font-semibold">{demo.role}</span>
                    <span className="block text-on-surface-variant">@{demo.username}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-on-surface-variant">
              Contraseña común del seed: <code>ClinicaAngry1</code>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-secondary hover:underline">
              Regístrate como paciente
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}