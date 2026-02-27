import { useScrollToSection } from '../../hooks/useScrollToSection'

export default function About() {
  const scrollTo = useScrollToSection()

  return (
    <section style={{ padding: 'clamp(80px, 10vw, 120px) 0' }}>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 var(--gutter)',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}
        className="about-grid"
      >
        {/* Image */}
        <div>
          <img
            src="/images/consulting.jpg"
            alt="Consulting session"
            style={{
              width: '100%',
              height: 480,
              objectFit: 'cover',
              borderRadius: 16,
              display: 'block',
            }}
          />
        </div>

        {/* Text */}
        <div>
          <p className="eyebrow" style={{ marginBottom: 20 }}>Who we are</p>
          <h2
            className="section-heading"
            style={{ marginBottom: 24 }}
            dangerouslySetInnerHTML={{ __html: 'It\'s about <em>your business,</em> not ours.' }}
          />
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: 32, maxWidth: 460 }}>
            We guide organisations through the unique complexities of transformation, combining deep industry expertise with disciplined execution to unlock measurable performance outcomes.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => scrollTo('capabilities')}
          >
            Our services
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .about-grid img { height: 320px !important; }
        }
      `}</style>
    </section>
  )
}
