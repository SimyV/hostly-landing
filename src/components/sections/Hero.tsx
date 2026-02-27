import { useScrollToSection } from '../../hooks/useScrollToSection'

export default function Hero() {
  const scrollTo = useScrollToSection()

  return (
    <section
      style={{
        position: 'relative',
        paddingTop: 'clamp(140px, 20vh, 220px)',
        paddingBottom: 'clamp(80px, 12vh, 140px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 var(--gutter)', position: 'relative' }}>
        {/* Headline — large serif, centred right like the reference */}
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(40px, 6vw, 76px)',
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: '-1px',
            color: '#2A2A2A',
            maxWidth: 900,
            marginBottom: 32,
          }}
        >
          Your partners in business and technology{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>transformation</em>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: 'clamp(16px, 1.3vw, 20px)',
            lineHeight: 1.65,
            color: 'var(--color-text-secondary)',
            maxWidth: 540,
            marginBottom: 48,
          }}
        >
          We take enterprises from AI experimentation to production delivery.
          Operating models, governance, and architecture built to hold under
          real organisational pressure.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => scrollTo('contact')}>
            Get in touch
          </button>
          <button className="btn btn-secondary" onClick={() => scrollTo('work')}>
            View our work
          </button>
        </div>
      </div>
    </section>
  )
}
