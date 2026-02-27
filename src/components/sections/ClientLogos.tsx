// Each logo gets a distinct typographic treatment to feel like a real branded wordmark
const logoStyles: Record<string, React.CSSProperties> = {
  'Dulux Group': { fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase' as const },
  'Orica': { fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' as const },
  'Kmart': { fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', textTransform: 'lowercase' as const },
  'Treasury Wine Estates': { fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 400, letterSpacing: '2px', fontStyle: 'italic', textTransform: 'none' as const },
  'ANZ': { fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' as const },
  'NAB': { fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' as const },
  'QBE Insurance': { fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' as const },
  'WorkSafe Victoria': { fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'none' as const },
  'Melbourne Business School': { fontFamily: "'EB Garamond', serif", fontSize: 16, fontWeight: 500, letterSpacing: '2.5px', textTransform: 'uppercase' as const },
}

const displayNames: Record<string, string> = {
  'Dulux Group': 'DULUX',
  'Orica': 'ORICA',
  'Kmart': 'kmart',
  'Treasury Wine Estates': 'Treasury Wine Estates',
  'ANZ': 'ANZ',
  'NAB': 'NAB',
  'QBE Insurance': 'QBE',
  'WorkSafe Victoria': 'WorkSafe',
  'Melbourne Business School': 'MBS',
}

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
          <span
            key={`${logo.name}-${i}`}
            style={{
              ...logoStyles[logo.name],
              color: 'rgba(42,42,42,0.3)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {displayNames[logo.name] || logo.name}
          </span>
        ))}
      </div>
    </section>
  )
}
