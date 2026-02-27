import { useState } from 'react'
import { Link } from 'react-router-dom'
import { articles } from '../../data/articles'

const PAGE_SIZE = 6

export default function Insights() {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? articles : articles.slice(0, PAGE_SIZE)

  return (
    <section id="insights" style={{ padding: 'clamp(80px, 10vw, 120px) 0' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 var(--gutter)' }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p className="eyebrow" style={{ marginBottom: 20 }}>Insights</p>
          <h2 className="section-heading" dangerouslySetInnerHTML={{ __html: 'Perspectives on<br/>enterprise <em>AI</em>' }} />
        </div>

        {/* Grid */}
        <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 40 }}>
          {visible.map((a) => (
            <Link
              key={a.slug}
              to={`/insights/${a.slug}`}
              style={{
                textDecoration: 'none',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span
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
                  {a.tag}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  {a.date}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 20,
                  fontWeight: 400,
                  lineHeight: 1.35,
                  color: '#2A2A2A',
                  marginBottom: 12,
                }}
              >
                {a.title}
              </h3>

              {/* Excerpt */}
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--color-text-secondary)', flex: 1, marginBottom: 20 }}>
                {a.excerpt}
              </p>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  {a.readTime} read
                </span>
                <span style={{ color: 'var(--color-accent)', fontSize: 14 }}>&rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Show more */}
        {!showAll && articles.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setShowAll(true)} className="btn btn-secondary">
              Show all articles
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) { .insights-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .insights-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
