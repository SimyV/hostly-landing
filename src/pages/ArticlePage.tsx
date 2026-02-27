import { useParams, Link } from 'react-router-dom'
import { articles } from '../data/articles'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return (
      <main className="pt-[120px] pb-[100px]">
        <div className="container text-center">
          <h1 className="font-heading text-[36px] text-text mb-[16px]">Article not found</h1>
          <p className="text-text-secondary mb-[32px]">
            The article you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-ghost">
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-[120px] pb-[100px] max-md:pt-[90px]">
      <article className="container max-w-[720px]">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-[8px] text-[13px] text-text-secondary no-underline hover:text-text transition-colors mb-[48px]"
        >
          &larr; Back to insights
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-[12px] mb-[24px]">
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-accent bg-accent-glow border border-[rgba(212,168,83,0.25)] px-[10px] py-[4px] rounded-[3px]">
            {article.tag}
          </span>
          <span className="font-mono text-[10px] text-text-tertiary tracking-[0.04em]">
            {article.date}
          </span>
          <span className="font-mono text-[10px] text-text-tertiary tracking-[0.04em]">
            {article.readTime} read
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-[clamp(28px,4vw,44px)] font-normal leading-[1.2] tracking-[-0.5px] text-text mb-[32px]">
          {article.title}
        </h1>

        {/* Body */}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      </article>
    </main>
  )
}
