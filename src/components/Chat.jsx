import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import Background from './Background'
import LogoIcon from './LogoIcon'

const fmt = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function Chat({ session }) {
  const me = session.user.id
  const [side, setSide] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [localTyping, setLocalTyping] = useState(false)
  const [remoteSide, setRemoteSide] = useState(null)

  const sideRef = useRef(null)
  const channelRef = useRef(null)
  const lastSent = useRef(0)
  const localTimer = useRef(null)
  const remoteTimer = useRef(null)
  const endRef = useRef(null)

  // Load my side + message history
  useEffect(() => {
    let alive = true
    supabase.from('members').select('side').eq('user_id', me).maybeSingle()
      .then(({ data }) => {
        if (alive && data) { setSide(data.side); sideRef.current = data.side }
      })
    supabase.from('messages')
      .select('id, sender_id, content, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!alive) return
        if (error) setError('Could not load messages.')
        else setMessages(data.reverse())
      })
    return () => { alive = false }
  }, [me])

  // Realtime: new messages (protected by RLS)
  useEffect(() => {
    const ch = supabase.channel('us-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        (p) => setMessages((prev) =>
          prev.some((m) => m.id === p.new.id) ? prev : [...prev, p.new]))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // Realtime: typing signal (private channel)
  useEffect(() => {
    const ch = supabase.channel('us-typing', { config: { private: true } })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setRemoteSide(payload.side)
        clearTimeout(remoteTimer.current)
        remoteTimer.current = setTimeout(() => setRemoteSide(null), 2500)
      })
      .subscribe()
    channelRef.current = ch
    return () => {
      clearTimeout(remoteTimer.current)
      supabase.removeChannel(ch)
    }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleChange(e) {
    setText(e.target.value)
    setLocalTyping(true)
    clearTimeout(localTimer.current)
    localTimer.current = setTimeout(() => setLocalTyping(false), 2000)
    const now = Date.now()
    if (sideRef.current && now - lastSent.current > 1500) {
      lastSent.current = now
      channelRef.current?.send({
        type: 'broadcast', event: 'typing', payload: { side: sideRef.current },
      })
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setError('')
    const { data, error } = await supabase.from('messages')
      .insert({ content })
      .select('id, sender_id, content, created_at')
      .single()
    if (error) {
      setError('Message not sent. Try again.')
    } else {
      setMessages((prev) => prev.some((m) => m.id === data.id) ? prev : [...prev, data])
      setText('')
      setLocalTyping(false)
      clearTimeout(localTimer.current)
    }
    setSending(false)
  }

  const blue = remoteSide === 'blue' || (localTyping && side === 'blue')
  const pink = remoteSide === 'pink' || (localTyping && side === 'pink')

  return (
    <>
      <Background blue={blue} pink={pink} />
      <div className="chat-wrap">
        <section className="chat">
          <header className="chat-head">
            <div className="logo">
              <LogoIcon />
              <div>
                <div className="logo-text">US</div>
                <div className="status">{remoteSide ? 'typing…' : 'private chat'}</div>
              </div>
            </div>
            <button className="ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </header>

          <div className="msgs">
            {messages.length === 0 && <p className="muted empty">No messages yet. Say hi 👋</p>}
            {messages.map((m) => (
              <div key={m.id} className={'msg ' + (m.sender_id === me ? 'me' : 'them')}>
                <span dir="auto">{m.content}</span>
                <time>{fmt(m.created_at)}</time>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {error && <p className="error chat-error">{error}</p>}

          <form className="composer" onSubmit={handleSend}>
            <input
              dir="auto"
              value={text}
              onChange={handleChange}
              placeholder="Write a message…"
              maxLength={2000}
              autoComplete="off"
            />
            <button className="btn send" disabled={sending || !text.trim()}>Send</button>
          </form>
        </section>
      </div>
    </>
  )
}
