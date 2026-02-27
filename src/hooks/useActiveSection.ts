import { useState, useEffect } from 'react'

export function useActiveSection(): string {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { threshold: 0.3 }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  return activeId
}
