import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Browser bundles must never contain privileged or legacy JWT credentials.
const missingCredentials = !supabaseUrl || !supabaseAnonKey?.startsWith('sb_publishable_')

export const supabase = missingCredentials
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)

export function assertSupabase() {
  if (missingCredentials || !supabase) {
    throw new Error(
      'O acesso está temporariamente indisponível. Tente novamente mais tarde.'
    )
  }
  return supabase
}
