import { useScrollToSection } from '../../hooks/useScrollToSection'

export default function Hero() {
  const scrollTo = useScrollToSection()

  return (
    <section className="pt-[140px] pb-[80px] max-md:pt-[100px] max-md:pb-[60px]">
      <div className="container">
        <div className="max-w-[720px]">
          {/* Eyebrow */}
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-accent mb-[32px] flex items-center gap-[10px]">
            <span className="block w-[28px] h-[1px] bg-accent" />
            Enterprise AI &amp; Architecture
          </div>

          <h1 className="font-heading text-[clamp(38px,5.4vw,72px)] font-normal leading-[1.06] tracking-[-1px] mb-[24px] text-text">
            Building the systems{' '}
            that make AI work{' '}
            <span className="text-accent">at scale.</span>
          </h1>

          <p className="text-[17px] leading-[1.8] text-text-secondary max-w-[540px] mb-[40px]">
            Strategy, architecture, and delivery leadership for enterprises
            turning AI ambition into operational capability.
          </p>

          <div className="flex gap-[12px] flex-wrap">
            <button onClick={() => scrollTo('contact')} className="btn btn-white">
              Start a conversation
            </button>
            <button onClick={() => scrollTo('work')} className="btn btn-ghost">
              View our work
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
