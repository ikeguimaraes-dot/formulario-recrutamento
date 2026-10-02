import { EMPRESAS } from './constants.js'

// UI convenience only. Database RLS remains the authority for every operation.
export function authorizedCompanies(data) {
  if (!Array.isArray(data)) return []
  return EMPRESAS.filter(company => data.includes(company))
}
