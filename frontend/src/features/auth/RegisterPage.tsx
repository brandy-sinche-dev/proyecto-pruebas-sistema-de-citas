import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api, toDisplayError } from '@/services'
import { registerSchema, type RegisterFormValues } from '@/schemas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertBanner } from '@/components/ui/Feedback'

export function RegisterPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { password: 'Clave123', confirmPassword: 'Clave123' },
  })

  if (isAuthenticated) return <Navigate to="/" replace />

  async function onSubmit(values: RegisterFormValues) {
    setError(null)
    try {
      await api.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        username: values.username,
        password: values.password,
      })
      const user = await login({ username: values.username, password: values.password })
      if (user) navigate('/paciente')
    } catch (err) {
      setError(toDisplayError(err))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-surface-container-lowest p-6 shadow-tier2 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-xl font-bold text-white">
            A
          </span>
          <div>
            <p className="font-display text-xl font-bold text-primary">Clínica Angry</p>
            <p className="text-xs text-on-surface-variant">Registro de paciente</p>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-primary">Crear cuenta</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Completa tus datos para agendar citas</p>

        {error && (
          <div className="mt-4">
            <AlertBanner variant="error">{error}</AlertBanner>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre"
              placeholder="María"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Apellido"
              placeholder="Gómez"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="maria@mail.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Usuario"
            placeholder="maria.gomez"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creando cuenta…' : 'Registrarme'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-secondary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}