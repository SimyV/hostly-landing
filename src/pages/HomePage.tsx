import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Hero from '../components/sections/Hero'
import ClientLogos from '../components/sections/ClientLogos'
import Capabilities from '../components/sections/Capabilities'
import CaseStudies from '../components/sections/CaseStudies'
import Insights from '../components/sections/Insights'
import Contact from '../components/sections/Contact'

export default function HomePage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo')
    if (scrollTo) {
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [searchParams])

  return (
    <main>
      <Hero />
      <ClientLogos />
      <Capabilities />
      <CaseStudies />
      <Insights />
      <Contact />
    </main>
  )
}
