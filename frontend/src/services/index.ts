import { mockApi } from './mock/mockApi'
import { realApi, toDisplayError } from './http'

export const isMock = import.meta.env.VITE_USE_MOCK !== 'false'

export const api = isMock ? mockApi : realApi

export { API_BASE_URL, realApi } from './http'
export { toDisplayError }