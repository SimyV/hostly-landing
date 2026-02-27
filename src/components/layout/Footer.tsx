import { useScrollToSection } from '../../hooks/useScrollToSection'

const nav = [
  { label: 'Services', id: 'capabilities' },
  { label: 'Approach', id: 'work' },
  { label: 'Insights', id: 'insights' },
  { label: 'Contact', id: 'contact' },
]

export default function Footer() {
  const scrollTo = useScrollToSection()

  return (
    <footer className="section-dark">
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '56px var(--gutter) 40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 40,
            marginBottom: 56,
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, color: '#fff', letterSpacing: '-0.3px', marginBottom: 10 }}>
              Host-ly Co
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 260 }}>
              Enterprise AI strategy, architecture, and technology consulting. Melbourne, Australia.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'color 200ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            &copy; {new Date().getFullYear()} Host-ly Co
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            ABN 88 616 024 695
          </span>
        </div>
      </div>
    </footer>
  )
}
