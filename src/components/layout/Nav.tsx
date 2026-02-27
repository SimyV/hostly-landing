import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScrollToSection } from '../../hooks/useScrollToSection'
import { useActiveSection } from '../../hooks/useActiveSection'

const links = [
  { label: 'Capabilities', id: 'capabilities' },
  { label: 'Work', id: 'work' },
  { label: 'Insights', id: 'insights' },
  { label: 'Contact', id: 'contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrollTo = useScrollToSection()
  const activeId = useActiveSection()
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(10,10,10,0.92)] backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between h-[56px]">
        <Link to="/" className="font-heading text-[20px] tracking-[0.02em] text-text no-underline">
          Host-ly<span className="text-accent">.</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-[32px]">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`bg-transparent border-none text-[13px] tracking-[0.02em] cursor-pointer transition-colors duration-200 ${
                isHome && activeId === link.id
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden bg-transparent border-none text-text text-[22px] cursor-pointer p-[8px]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '\u2715' : '\u2630'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[rgba(10,10,10,0.95)] backdrop-blur-md border-t border-border pb-[24px]">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                scrollTo(link.id)
                setMobileOpen(false)
              }}
              className="block w-full text-left bg-transparent border-none text-text-secondary hover:text-text text-[14px] tracking-[0.02em] cursor-pointer px-[var(--pad)] py-[12px] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
