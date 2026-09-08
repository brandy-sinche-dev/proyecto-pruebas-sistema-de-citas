import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

const recoverySchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
})
type RecoveryFormValues = z.infer<typeof recoverySchema>

export function PasswordRecoveryPage() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryFormValues>({ resolver: zodResolver(recoverySchema) })

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="flex w-full max-w-md flex-col gap-5">
        <Card className="shadow-tier-2">
          <CardBody className="gap-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="material-symbols-outlined rounded-full bg-primary p-3 text-3xl text-white">medical_information</span>
              <h1 className="font-display text-2xl font-bold text-primary">Recuperar contraseña</h1>
              <p className="text-sm text-on-surface-variant">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu acceso.
              </p>
            </div>

            {!sent ? (
              <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(() => setSent(true))}>
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="correo@clinicaangry.pe"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" variant="primary">
                  <span className="material-symbols-outlined text-base">mail</span>
                  Enviar enlace
                </Button>
              </form>
            ) : (
              <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
                Si el correo existe, recibirás un enlace de restablecimiento en unos minutos.
              </div>
            )}

            <p className="text-center text-sm text-on-surface-variant">
              <Link to="/login" className="font-medium text-secondary hover:underline">Volver a iniciar sesión</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}