import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Background from './Background'
import LogoIcon from './LogoIcon'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Incorrect email or password.')
    setBusy(false)
  }

  return (
    <>
      <Background />
      <main className="center">
        <form className="card" onSubmit={handleSubmit}>
          <div className="logo">
            <LogoIcon />
            <span className="logo-text">US</span>
          </div>
          <div>
            <h1 className="title">Welcome back</h1>
            <p className="muted">Sign in to your private space.</p>
          </div>

          <label className="field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in →'}
          </button>

          <p className="foot">Invitation only. Public sign-ups are disabled.</p>
        </form>
      </main>
    </>
  )
}
