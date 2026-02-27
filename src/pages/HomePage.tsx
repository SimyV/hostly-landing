import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageQuickNav from '../components/layout/PageQuickNav'
import Hero from '../components/sections/Hero'
import ClientLogos from '../components/sections/ClientLogos'
import About from '../components/sections/About'
import ImageCollage from '../components/sections/ImageCollage'
import Capabilities from '../components/sections/Capabilities'
import CaseStudies from '../components/sections/CaseStudies'
import Insights from '../components/sections/Insights'
import Contact from '../components/sections/Contact'

export default function HomePage() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const target = searchParams.get('scrollTo')
    if (target) {
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [searchParams])

  return (
    <main>
      <PageQuickNav />
      <Hero />
      <ClientLogos />
      <About />
      <ImageCollage />
      <Capabilities />
      <CaseStudies />
      <Insights />
      <Contact />
    </main>
  )
}
