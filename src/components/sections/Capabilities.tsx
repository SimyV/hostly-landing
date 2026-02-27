import { capabilities } from '../../data/capabilities'

export default function Capabilities() {
  return (
    <section id="capabilities" className="py-[80px] max-md:py-[48px]">
      <div className="container">
        {/* Eyebrow */}
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-accent mb-[24px] flex items-center gap-[10px]">
          <span className="block w-[28px] h-[1px] bg-accent" />
          What we do
        </div>

        {/* Header */}
        <div className="grid grid-cols-2 gap-[80px] mb-[48px] max-md:grid-cols-1 max-md:gap-[16px]">
          <h2 className="font-heading text-[clamp(28px,3.6vw,42px)] font-normal leading-[1.2] tracking-[-0.5px] text-text">
            Capabilities
          </h2>
          <p className="text-[15px] leading-[1.8] text-text-secondary self-end">
            From AI strategy through to production delivery &mdash; the full
            spectrum of enterprise architecture and technology leadership.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-px bg-border rounded-[8px] overflow-hidden max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {capabilities.map((cap) => (
            <div
              key={cap.number}
              className="bg-bg-card p-[32px] hover:bg-bg-card-hover transition-colors duration-200"
            >
              <span className="font-mono text-[11px] text-accent tracking-[0.06em] block mb-[16px]">
                {cap.number}
              </span>
              <h3 className="font-heading text-[20px] font-normal leading-[1.3] mb-[10px] text-text">
                {cap.title}
              </h3>
              <p className="text-[13px] leading-[1.7] text-text-secondary">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
