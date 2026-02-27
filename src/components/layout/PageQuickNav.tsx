import { useEffect, useState } from 'react'
import { useScrollToSection } from '../../hooks/useScrollToSection'

const items = [
  { label: 'Services', id: 'capabilities' },
  { label: 'Approach', id: 'work' },
  { label: 'Insights', id: 'insights' },
  { label: 'Contact', id: 'contact' },
]

export default function PageQuickNav() {
  const scrollTo = useScrollToSection()
  const [active, setActive] = useState<string>('')
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)

    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: [0.25, 0.5, 0.75] }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 460)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <aside
        className="quick-nav"
        style={{
          position: 'fixed',
          right: 18,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 90,
          width: 172,
          background: 'rgba(248,241,232,0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 12,
          padding: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        {items.map((item) => {
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
                border: 'none',
                borderRadius: 8,
                background: isActive ? 'rgba(232,97,60,0.14)' : 'transparent',
                color: isActive ? '#E8613C' : '#2A2A2A',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                padding: '9px 10px',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isActive ? '#E8613C' : 'rgba(42,42,42,0.25)',
                  flexShrink: 0,
                }}
              />
              {item.label}
            </button>
          )
        })}
      </aside>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Return to top"
          style={{
            position: 'fixed',
            right: 18,
            bottom: 22,
            zIndex: 90,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.14)',
            background: '#E8613C',
            color: '#fff',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .quick-nav { display: none; }
        }
      `}</style>
    </>
  )
}
