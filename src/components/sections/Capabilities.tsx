import { capabilities } from '../../data/capabilities'

export default function Capabilities() {
  return (
    <section id="capabilities" className="section-dark" style={{ padding: 'clamp(80px, 10vw, 120px) 0' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 var(--gutter)' }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p className="eyebrow" style={{ marginBottom: 20 }}>What we do</p>
          <h2 className="section-heading" dangerouslySetInnerHTML={{ __html: 'Six disciplines,<br/>one <em>integrated</em> practice' }} />
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
          className="cap-grid"
        >
          {capabilities.map((cap) => (
            <div
              key={cap.number}
              style={{
                background: '#333',
                padding: 36,
                transition: 'background 200ms',
                cursor: 'default',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#3a3a3a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#333')}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-accent)',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: 20,
                }}
              >
                {cap.number}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 22,
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: '#fff',
                  marginBottom: 12,
                }}
              >
                {cap.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' }}>
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .cap-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .cap-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
