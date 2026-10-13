import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import Chat from './components/Chat'
import Background from './components/Background'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <>
        <Background />
        <main className="center"><p className="muted">Loading…</p></main>
      </>
    )
  }
  return session ? <Chat session={session} /> : <Login />
}
