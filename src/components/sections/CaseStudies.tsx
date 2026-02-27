import { caseStudies } from '../../data/caseStudies'

export default function CaseStudies() {
  return (
    <section id="work" style={{ padding: 'clamp(80px, 10vw, 120px) 0' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 var(--gutter)' }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p className="eyebrow" style={{ marginBottom: 20 }}>Selected work</p>
          <h2 className="section-heading" dangerouslySetInnerHTML={{ __html: 'Real outcomes from<br/><em>complex</em> programs' }} />
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {caseStudies.map((cs, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                padding: 36,
                transition: 'border-color 200ms, box-shadow 200ms',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Tags row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                {cs.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-muted)',
                      padding: '3px 10px',
                      borderRadius: 4,
                    }}
                  >
                    {tag}
                  </span>
                ))}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-text-tertiary)',
                    marginLeft: 'auto',
                  }}
                  className="cs-sector"
                >
                  {cs.sector}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(20px, 2.2vw, 26px)',
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: '#2A2A2A',
                  marginBottom: 12,
                }}
              >
                {cs.title}
              </h3>

              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text-secondary)', maxWidth: 720 }}>
                {cs.description}
              </p>

              {cs.outcomes.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 40,
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {cs.outcomes.map((o, j) => (
                    <div key={j}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 30,
                          fontWeight: 500,
                          color: 'var(--color-accent-warm)',
                          display: 'block',
                          lineHeight: 1.1,
                        }}
                      >
                        {o.value}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4, display: 'block' }}>
                        {o.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .cs-sector { margin-left: 0 !important; } }
      `}</style>
    </section>
  )
}
