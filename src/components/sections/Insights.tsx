import { useState } from 'react'
import { Link } from 'react-router-dom'
import { articles } from '../../data/articles'

const STEP = 3
const PAGE_SIZE = 6

export default function Insights() {
  const [offset, setOffset] = useState(0)

  const visible = articles.slice(offset, offset + PAGE_SIZE)
  const canShowMore = offset + PAGE_SIZE < articles.length
  const canShowEarlier = offset > 0

  return (
    <section id="insights" className="py-[80px] max-md:py-[48px]">
      <div className="container">
        {/* Eyebrow */}
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-accent mb-[24px] flex items-center gap-[10px]">
          <span className="block w-[28px] h-[1px] bg-accent" />
          Insights
        </div>

        {/* Header */}
        <div className="grid grid-cols-2 gap-[80px] mb-[48px] max-md:grid-cols-1 max-md:gap-[16px]">
          <h2 className="font-heading text-[clamp(28px,3.6vw,42px)] font-normal leading-[1.2] tracking-[-0.5px] text-text">
            Perspectives on enterprise AI
          </h2>
          <p className="text-[15px] leading-[1.8] text-text-secondary self-end">
            Analysis and commentary on the strategic, architectural, and
            organisational dimensions of AI in the enterprise.
          </p>
        </div>

        {/* Article cards */}
        <div className="grid grid-cols-3 gap-px bg-border rounded-[8px] overflow-hidden mb-[48px] max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
          {visible.map((article) => (
            <Link
              key={article.slug}
              to={`/insights/${article.slug}`}
              className="bg-bg-card flex flex-col no-underline transition-colors duration-200 hover:bg-bg-card-hover group"
            >
              <div className="p-[32px] flex flex-col flex-1">
                {/* Tag + date */}
                <div className="flex items-center gap-[12px] mb-[16px]">
                  <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-accent bg-accent-glow border border-[rgba(212,168,83,0.25)] px-[10px] py-[4px] rounded-[3px]">
                    {article.tag}
                  </span>
                  <span className="font-mono text-[10px] text-text-tertiary tracking-[0.04em]">
                    {article.date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading text-[22px] font-normal leading-[1.3] tracking-[-0.2px] text-text mb-[12px]">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[13px] leading-[1.7] text-text-secondary flex-1 mb-[24px]">
                  {article.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                  <span className="font-mono">{article.readTime} read</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-[4px]">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-[16px]">
          {canShowEarlier && (
            <button
              onClick={() => setOffset(Math.max(0, offset - STEP))}
              className="btn btn-ghost text-[13px]"
            >
              Show earlier articles
            </button>
          )}
          {canShowMore && (
            <button
              onClick={() => setOffset(offset + STEP)}
              className="btn btn-ghost text-[13px]"
            >
              Show more articles
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
