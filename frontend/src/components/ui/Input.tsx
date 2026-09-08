import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label?: string
  error?: string
  hint?: string
}

export function Field({ label, error, hint, htmlFor, children }: FieldProps & { htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ className, label, error, hint, id, ...props }, ref) {
    const autoId = useId()
    const inputId = id ?? autoId
    return (
      <Field label={label} error={error} hint={hint} htmlFor={inputId}>
        <input id={inputId} ref={ref} className={cn('input', error && 'border-red-600 focus:outline-red-600/15', className)} {...props} />
      </Field>
    )
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  function Textarea({ className, label, error, hint, id, ...props }, ref) {
    const autoId = useId()
    const textareaId = id ?? autoId
    return (
      <Field label={label} error={error} hint={hint} htmlFor={textareaId}>
        <textarea id={textareaId} ref={ref} className={cn('input min-h-24 py-2', error && 'border-red-600 focus:outline-red-600/15', className)} {...props} />
      </Field>
    )
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  function Select({ className, label, error, hint, id, children, ...props }, ref) {
    const autoId = useId()
    const selectId = id ?? autoId
    return (
      <Field label={label} error={error} hint={hint} htmlFor={selectId}>
        <select id={selectId} ref={ref} className={cn('input', error && 'border-red-600 focus:outline-red-600/15', className)} {...props}>
          {children}
        </select>
      </Field>
    )
  },
)