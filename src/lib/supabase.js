import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const missingCredentials = !supabaseUrl || !supabaseAnonKey

export const supabase = missingCredentials
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)

export function assertSupabase() {
  if (missingCredentials || !supabase) {
    throw new Error(
      'Credenciais Supabase ausentes. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
    )
  }
  return supabase
}
