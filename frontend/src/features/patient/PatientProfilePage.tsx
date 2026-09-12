import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AlertBanner, Spinner } from '@/components/ui/Feedback'
import { useAuth } from '@/hooks/useAuth'
import { useMutations, usePatientProfile } from '@/hooks/queries'
import { profileSchema, type ProfileFormValues } from '@/schemas'

export function PatientProfilePage() {
  const { user, updateUser } = useAuth()
  const { data: profile, isLoading } = usePatientProfile()
  const { updateProfile } = useMutations()
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })

  function onSubmit(values: ProfileFormValues) {
    setErrorMsg(null)
    updateProfile.mutate(
      { firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone },
      {
        onSuccess: (updated) => {
          updateUser(updated)
          setSaved(true)
          window.setTimeout(() => setSaved(false), 4000)
        },
        onError: (err) => setErrorMsg(err.message),
      },
    )
  }

  return (
    <>
      <PageHeader eyebrow="Portal del paciente" title="Mi perfil" description="Mantén tus datos de contacto actualizados" />

      {isLoading && <Spinner />}

      <Card className="max-w-2xl">
        <CardHeader title="Datos personales" icon={<span className="material-symbols-outlined text-lg">account_circle</span>} />
        <CardBody>
          {errorMsg && <AlertBanner variant="error">{errorMsg}</AlertBanner>}
          {saved && <AlertBanner variant="success">Cambios guardados correctamente.</AlertBanner>}
          <form
            className="mt-4 flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombres" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Apellidos" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Correo electrónico" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Teléfono" placeholder="+51 999 999 999" error={errors.phone?.message} {...register('phone')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="DNI" value={profile?.documentNumber ?? ''} disabled />
              <Input label="Grupo sanguíneo" value={profile?.bloodType ?? ''} disabled />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !isDirty || updateProfile.isPending}>
                {updateProfile.isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  )
}