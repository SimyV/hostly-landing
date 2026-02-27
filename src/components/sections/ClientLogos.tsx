import { logos } from '../../data/logos'

export default function ClientLogos() {
  const doubled = [...logos, ...logos]

  return (
    <section
      style={{
        padding: '48px 0',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fades */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to right, #F8F1E8, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(to left, #F8F1E8, transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div
        style={{
          display: 'flex',
          gap: 64,
          animation: 'scroll 35s linear infinite',
          width: 'max-content',
          alignItems: 'center',
        }}
      >
        {doubled.map((logo, i) => (
          <img
            key={`${logo.name}-${i}`}
            src={logo.src}
            alt={logo.name}
            style={{
              height: 40,
              width: 'auto',
              objectFit: 'contain',
              flexShrink: 0,
              filter: 'grayscale(100%) brightness(0) opacity(0.2)',
              userSelect: 'none',
            }}
            draggable={false}
          />
        ))}
      </div>
    </section>
  )
}
