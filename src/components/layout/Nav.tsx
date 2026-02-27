import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScrollToSection } from '../../hooks/useScrollToSection'

const links = [
  { label: 'Services', id: 'capabilities' },
  { label: 'Approach', id: 'work' },
  { label: 'Insights', id: 'insights' },
  { label: 'Contact', id: 'contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const scrollTo = useScrollToSection()
  const { pathname } = useLocation()
  const navTextColor = scrolled ? '#2A2A2A' : '#F8F1E8'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const go = (id: string) => {
    setOpen(false)
    scrollTo(id)
  }

  return (
    <>
      <header
        style={{
          position: 'fixed',
          inset: '0 0 auto 0',
          zIndex: 100,
          height: 64,
          transition: 'background 400ms, border-color 400ms, backdrop-filter 400ms',
          background: scrolled ? 'rgba(248,241,232,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.4)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.06)' : 'transparent'}`,
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            height: '100%',
            margin: '0 auto',
            padding: '0 var(--gutter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img
              src="/hostly-mark.svg"
              alt="Host-ly Co"
              style={{ height: 36 }}
            />
          </Link>

          {/* Desktop */}
          <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '7px 14px',
                  color: navTextColor,
                  fontSize: 14,
                  fontWeight: 400,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'color 200ms',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  textDecorationColor: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = navTextColor)}
                onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = 'transparent')}
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="nav-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={navTextColor} strokeWidth="1.5" strokeLinecap="round">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: 'rgba(248,241,232,0.98)',
            backdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: 36,
                fontWeight: 400,
                color: '#2A2A2A',
                cursor: 'pointer',
                padding: '12px 24px',
                transition: 'opacity 200ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-toggle { display: flex !important; }
        }
      `}</style>
    </>
  )
}
