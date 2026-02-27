import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="container text-center">
        <span className="font-mono text-[80px] text-accent leading-none block mb-[16px]">
          404
        </span>
        <h1 className="font-heading text-[36px] text-text mb-[12px]">
          Page not found
        </h1>
        <p className="text-[15px] text-text-secondary mb-[32px]">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link to="/" className="btn btn-ghost">
          Back to home
        </Link>
      </div>
    </main>
  )
}
