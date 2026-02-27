import { useState } from 'react'
import { logos } from '../../data/logos'

const logoScale: Record<string, number> = {
  NDIS: 1.27,
  IOOF: 1.6,
  Zurich: 0.72,
  MLC: 1.46,
  NAB: 1.14,
  'Melbourne Business School': 0.9,
  'WorkSafe Tasmania': 1.67,
  'Treasury Wine Estates': 1.34,
  Opticomm: 0.9,
  Dulux: 0.9,
  Kmart: 1.36,
  Orica: 1.1,
  ANZ: 1.0,
}

export default function ClientLogos() {
  const doubled = [...logos, ...logos]
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  const handleError = (name: string) => {
    setImgErrors((prev) => new Set(prev).add(name))
  }

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
          <div
            key={`${logo.name}-${i}`}
            style={{
              height: 56,
              minWidth: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {imgErrors.has(logo.name) ? (
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'rgba(42,42,42,0.55)',
                  whiteSpace: 'nowrap',
                }}
              >
                {logo.name}
              </span>
            ) : (
              <img
                src={logo.src}
                alt={logo.name}
                style={{
                  height: 40,
                  width: 'auto',
                  objectFit: 'contain',
                  userSelect: 'none',
                  filter: 'grayscale(100%) contrast(1.08)',
                  opacity: 0.9,
                  mixBlendMode: 'multiply',
                  transform: `scale(${logoScale[logo.name] ?? 1})`,
                  transformOrigin: 'center',
                }}
                draggable={false}
                onError={() => handleError(logo.name)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
