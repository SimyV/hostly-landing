import { useNavigate, useLocation } from 'react-router-dom'
import { useCallback } from 'react'

export function useScrollToSection() {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback((sectionId: string) => {
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/?scrollTo=${sectionId}`)
    }
  }, [location.pathname, navigate])
}
