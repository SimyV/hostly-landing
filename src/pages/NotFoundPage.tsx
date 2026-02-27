import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', padding: '0 var(--gutter)' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 72,
            color: 'var(--color-accent)',
            lineHeight: 1,
            display: 'block',
            marginBottom: 16,
          }}
        >
          404
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 32,
            color: 'var(--color-text)',
            marginBottom: 12,
          }}
        >
          Page not found
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-secondary">Back to home</Link>
      </div>
    </main>
  )
}
