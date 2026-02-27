import { useScrollToSection } from '../../hooks/useScrollToSection'

export default function Hero() {
  const scrollTo = useScrollToSection()

  return (
    <section
      id="top"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 'clamp(96px, 12vh, 140px)',
        paddingBottom: 'clamp(72px, 8vh, 110px)',
        overflow: 'hidden',
        background: '#0f1116',
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src="/videos/hero-city.mp4" type="video/mp4" />
      </video>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(115deg, rgba(9,11,16,0.80) 0%, rgba(9,11,16,0.58) 40%, rgba(9,11,16,0.68) 100%)',
        }}
      />

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 var(--gutter)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(42px, 6vw, 78px)',
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: '-1px',
            color: '#fff',
            maxWidth: 960,
            marginBottom: 32,
            textWrap: 'balance',
          }}
        >
          Your partners in business and technology{' '}
          <em style={{ fontStyle: 'italic', color: '#E8613C' }}>transformation</em>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 1.3vw, 20px)',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.88)',
            maxWidth: 590,
            marginBottom: 48,
          }}
        >
          We take enterprises from AI experimentation to production delivery.
          Operating models, governance, and architecture built to hold under
          real organisational pressure.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => scrollTo('contact')}>
            Get in touch
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => scrollTo('work')}
            style={{
              color: '#F8F1E8',
              borderColor: 'rgba(248,241,232,0.72)',
              background: 'rgba(248,241,232,0.06)',
            }}
          >
            View our work
          </button>
        </div>
      </div>
    </section>
  )
}
