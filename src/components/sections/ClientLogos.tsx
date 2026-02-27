import { logos } from '../../data/logos'

export default function ClientLogos() {
  return (
    <section className="py-[40px] border-y border-border overflow-hidden">
      <div className="container mb-[20px]">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-text-tertiary text-center">
          Trusted by leading enterprises
        </p>
      </div>
      <div className="relative">
        {/* Fade edges */}
        <div
          className="absolute inset-y-0 left-0 w-[100px] z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #0A0A0A, transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[100px] z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #0A0A0A, transparent)' }}
        />

        <div
          className="flex gap-[48px] items-center w-max px-[40px]"
          style={{ animation: 'scroll 25s linear infinite' }}
        >
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-tertiary whitespace-nowrap select-none"
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
