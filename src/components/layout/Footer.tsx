import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border py-[48px]">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-[16px]">
        <Link to="/" className="font-heading text-[18px] tracking-[0.02em] text-text no-underline">
          Host-ly<span className="text-accent">.</span>
        </Link>
        <p className="text-text-secondary text-[13px]">
          &copy; {new Date().getFullYear()} Host-ly Co. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
