import { caseStudies } from '../../data/caseStudies'

export default function CaseStudies() {
  return (
    <section id="work" className="py-[100px] max-md:py-[60px]">
      <div className="container">
        {/* Eyebrow */}
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-accent mb-[48px] flex items-center gap-[10px]">
          <span className="block w-[28px] h-[1px] bg-accent" />
          Selected work
        </div>

        {/* Header */}
        <div className="grid grid-cols-2 gap-[80px] mb-[64px] max-md:grid-cols-1 max-md:gap-[20px]">
          <h2 className="font-heading text-[clamp(28px,3.6vw,42px)] font-normal leading-[1.2] tracking-[-0.5px] text-text">
            Case Studies
          </h2>
          <p className="text-[15px] leading-[1.8] text-text-secondary self-end">
            Enterprise-scale programs across AI strategy, architecture,
            technology transformation, and large-scale delivery.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-[4px]">
          {caseStudies.map((cs, i) => (
            <div
              key={i}
              className="bg-bg-card border border-border rounded-[8px] p-[32px] hover:border-border-hover hover:bg-bg-card-hover transition-all duration-200"
            >
              {/* Tags + sector */}
              <div className="flex flex-wrap items-center gap-[8px] mb-[16px]">
                {cs.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[9px] tracking-[0.12em] uppercase text-accent bg-accent-glow border border-[rgba(212,168,83,0.25)] px-[10px] py-[4px] rounded-[3px]"
                  >
                    {tag}
                  </span>
                ))}
                <span className="font-mono text-[10px] tracking-[0.04em] uppercase text-text-tertiary ml-auto">
                  {cs.sector}
                </span>
              </div>

              <h3 className="font-heading text-[22px] font-normal leading-[1.3] tracking-[-0.2px] text-text mb-[10px]">
                {cs.title}
              </h3>
              <p className="text-[13px] leading-[1.7] text-text-secondary max-w-[680px] mb-[24px]">
                {cs.description}
              </p>

              {cs.outcomes.length > 0 && (
                <div className="flex flex-wrap gap-[32px] pt-[16px] border-t border-border">
                  {cs.outcomes.map((o, j) => (
                    <div key={j}>
                      <span className="font-mono text-[26px] text-accent block leading-[1.2]">
                        {o.value}
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        {o.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
