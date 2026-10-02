import { useEffect, useState } from 'react'
import { assertSupabase } from '../lib/supabase'
import { authorizedCompanies } from '../lib/access'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [access, setAccess] = useState({ loading: true, companies: [], error: '' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    let active = true
    let subscription
    try {
      const client = assertSupabase()
      client.auth.getSession().then(({ data, error }) => {
        if (!active) return
        if (error) setLoginError('Não foi possível verificar sua sessão. Entre novamente.')
        setSession(data?.session ?? null)
        setInitializing(false)
      }).catch(() => {
        if (active) {
          setLoginError('Não foi possível verificar sua sessão. Tente novamente.')
          setInitializing(false)
        }
      })
      subscription = client.auth.onAuthStateChange((_event, nextSession) => {
        if (!active) return
        // Clear privileged children before checking the next session's scope.
        setAccess({ loading: true, companies: [], error: '' })
        setSession(nextSession)
        setInitializing(false)
      }).data.subscription
    } catch {
      setLoginError('O acesso está temporariamente indisponível. Tente novamente mais tarde.')
      setInitializing(false)
    }
    return () => { active = false; subscription?.unsubscribe() }
  }, [])

  useEffect(() => {
    let active = true
    if (!session?.user?.id) {
      setAccess({ loading: false, companies: [], error: '' })
      return () => { active = false }
    }
    setAccess({ loading: true, companies: [], error: '' })
    assertSupabase().rpc('get_job_requisition_access').then(({ data, error }) => {
      if (!active) return
      setAccess({
        loading: false,
        companies: error ? [] : authorizedCompanies(data),
        error: error ? 'Não foi possível verificar suas permissões. Entre novamente ou tente mais tarde.' : '',
      })
    }).catch(() => {
      if (active) setAccess({ loading: false, companies: [], error: 'Não foi possível verificar suas permissões. Tente novamente.' })
    })
    return () => { active = false }
  }, [session])

  async function signIn(event) {
    event.preventDefault()
    setSigningIn(true)
    setLoginError('')
    try {
      const { error } = await assertSupabase().auth.signInWithPassword({ email: email.trim(), password })
      if (error) setLoginError('Não foi possível entrar. Confira seu e-mail e senha.')
      else setPassword('')
    } catch {
      setLoginError('Não foi possível entrar. Tente novamente mais tarde.')
    } finally {
      setSigningIn(false)
    }
  }

  async function signOut() {
    setSession(null)
    setAccess({ loading: false, companies: [], error: '' })
    setPassword('')
    await assertSupabase().auth.signOut({ scope: 'local' })
  }

  if (!initializing && session && !access.loading && access.companies.length > 0) {
    return children({ user: session.user, companies: access.companies, signOut })
  }

  return (
    <main className="min-h-screen bg-forest text-cream flex items-center justify-center p-6">
      <section className="w-full max-w-md border border-gold/25 p-8" aria-labelledby="access-title">
        <p className="text-xs tracking-widest text-gold uppercase">Recursos Humanos · Uso interno</p>
        <h1 id="access-title" className="font-serif text-3xl mt-3 mb-6">Gestão de Vagas</h1>
        {initializing || (session && access.loading) ? (
          <p role="status">Verificando acesso…</p>
        ) : session ? (
          <>
            <p role="alert" className="mb-6">{access.error || 'Sua conta não tem acesso à gestão de vagas. Solicite a liberação ao RH.'}</p>
            <button className="px-5 py-3 border border-gold text-gold" onClick={signOut}>Sair e usar outra conta</button>
          </>
        ) : (
          <form onSubmit={signIn} className="space-y-5">
            <p className="text-sm text-cream/70">Entre com sua conta KPH para solicitar e acompanhar vagas das suas unidades.</p>
            <div>
              <label htmlFor="login-email" className="block mb-2">E-mail</label>
              <input id="login-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="field-base w-full" />
            </div>
            <div>
              <label htmlFor="login-password" className="block mb-2">Senha</label>
              <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="field-base w-full" />
            </div>
            {loginError && <p role="alert" className="text-red-300">{loginError}</p>}
            <button type="submit" disabled={signingIn} className="w-full px-5 py-3 bg-gold text-forest disabled:opacity-50">{signingIn ? 'Entrando…' : 'Entrar'}</button>
          </form>
        )}
      </section>
    </main>
  )
}
