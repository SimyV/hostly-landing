import { useState, type FormEvent } from 'react'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: 8,
  padding: '11px 14px',
  fontSize: 14,
  color: '#2A2A2A',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 200ms',
}

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    try {
      await fetch('https://formspree.io/f/mkovyrnp', {
        method: 'POST',
        body: new FormData(e.currentTarget),
        headers: { Accept: 'application/json' },
      })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="section-dark" style={{ padding: 'clamp(80px, 10vw, 120px) 0' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 var(--gutter)' }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p className="eyebrow" style={{ marginBottom: 20 }}>Contact</p>
          <h2 className="section-heading" dangerouslySetInnerHTML={{ __html: 'Start a <em>conversation</em>' }} />
        </div>

        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64 }}>
          {/* Left */}
          <div>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: 40 }}>
              Whether you have a defined brief or just a challenge you're thinking through — we'd love to hear about it. No pitch decks, no obligation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <a href="mailto:simon@host-ly.com" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'rgba(255,255,255,0.6)', transition: 'color 200ms' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: '#333', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13L2 4" /></svg>
                </span>
                <span style={{ fontSize: 14 }}>simon@host-ly.com</span>
              </a>

              <a href="tel:+61433651272" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'rgba(255,255,255,0.6)', transition: 'color 200ms' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: '#333', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                </span>
                <span style={{ fontSize: 14 }}>+61 433 651 272</span>
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: '#333', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </span>
                <span style={{ fontSize: 14 }}>Melbourne, Australia</span>
              </div>

              <a href="https://linkedin.com/in/simonlobascher" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'rgba(255,255,255,0.6)', transition: 'color 200ms' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: '#333', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                </span>
                <span style={{ fontSize: 14 }}>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {sent ? (
              <div style={{ background: '#333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 56, textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <span style={{ color: 'var(--color-accent)', fontSize: 18 }}>&#10003;</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: '#fff', marginBottom: 10 }}>Message sent</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Thanks for getting in touch. We'll respond within one business day.</p>
              </div>
            ) : (
              <form onSubmit={submit} style={{ background: '#333', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 32 }}>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Name</label>
                    <input type="text" name="name" required placeholder="Your name" style={{ ...fieldStyle, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Email</label>
                    <input type="email" name="email" required placeholder="you@company.com" style={{ ...fieldStyle, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Organisation</label>
                  <input type="text" name="organisation" placeholder="Company name" style={{ ...fieldStyle, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Topic</label>
                  <select name="topic" defaultValue="" style={{ ...fieldStyle, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', appearance: 'none' as const }} onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
                    <option value="" disabled>Select a topic</option>
                    <option>AI Strategy &amp; Operating Model</option>
                    <option>Enterprise Architecture</option>
                    <option>Technology Strategy &amp; Roadmap</option>
                    <option>Agentic AI Platform</option>
                    <option>Program Leadership</option>
                    <option>Executive Coaching</option>
                    <option>Something else</option>
                  </select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Message</label>
                  <textarea name="message" required rows={4} placeholder="Tell us about your project or challenge..." style={{ ...fieldStyle, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' as const, minHeight: 110, fontFamily: 'inherit' }} onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')} onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>

                <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                <div className="form-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Typically responds within one business day.</span>
                  <button type="submit" disabled={sending} className="btn btn-primary" style={{ opacity: sending ? 0.5 : 1 }}>
                    {sending ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .form-row { grid-template-columns: 1fr !important; }
          .form-footer { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>
    </section>
  )
}
