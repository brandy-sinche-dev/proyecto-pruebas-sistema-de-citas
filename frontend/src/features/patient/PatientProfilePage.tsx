import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AlertBanner } from '@/components/ui/Feedback'
import { useAuth } from '@/hooks/useAuth'
import { profileSchema, type ProfileFormValues } from '@/schemas'

export function PatientProfilePage() {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      phone: '+51 911 111 111',
    },
  })

  return (
    <>
      <PageHeader eyebrow="Portal del paciente" title="Mi perfil" description="Mantén tus datos de contacto actualizados" />

      <Card className="max-w-2xl">
        <CardHeader title="Datos personales" icon={<span className="material-symbols-outlined text-lg">account_circle</span>} />
        <CardBody>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit((values) => {
              reset(values)
            })}
          >
            {isDirty && <AlertBanner variant="success">Cambios guardados correctamente.</AlertBanner>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombres" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Apellidos" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Correo electrónico" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Teléfono" placeholder="+51 999 999 999" error={errors.phone?.message} {...register('phone')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="DNI" value="70234561" disabled />
              <Input label="Grupo sanguíneo" value="O+" disabled />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  )
}