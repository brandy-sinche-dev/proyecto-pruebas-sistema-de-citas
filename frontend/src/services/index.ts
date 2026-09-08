import { mockApi } from './mock/mockApi'

export const isMock = true

export const api = mockApi

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export function toDisplayError(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}