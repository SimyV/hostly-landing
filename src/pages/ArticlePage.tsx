import { useParams, Link } from 'react-router-dom'
import { articles } from '../data/articles'

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return (
      <main style={{ paddingTop: 120, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 var(--gutter)', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, color: 'var(--color-text)', marginBottom: 16 }}>
            Article not found
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 32 }}>
            The article you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-secondary">Back to home</Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ paddingTop: 120, paddingBottom: 100 }}>
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '0 var(--gutter)' }}>
        {/* Back */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            marginBottom: 48,
            transition: 'color 200ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          &larr; Back to insights
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              background: 'var(--color-accent-muted)',
              padding: '3px 10px',
              borderRadius: 4,
            }}
          >
            {article.tag}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            {article.date}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            {article.readTime} read
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            color: 'var(--color-text)',
            marginBottom: 36,
          }}
        >
          {article.title}
        </h1>

        {/* Body */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.body }} />
      </article>
    </main>
  )
}
