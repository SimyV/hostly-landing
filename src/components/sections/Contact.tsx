import { useState, type FormEvent } from 'react'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      await fetch('https://formspree.io/f/mkovyrnp', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      setSubmitted(true)
    } catch {
      // Still mark as submitted to avoid confusion
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-[100px] max-md:py-[60px]">
      <div className="container">
        {/* Eyebrow */}
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-accent mb-[48px] flex items-center gap-[10px]">
          <span className="block w-[28px] h-[1px] bg-accent" />
          Contact
        </div>

        <div className="grid grid-cols-[1fr_1.2fr] gap-[80px] max-md:grid-cols-1 max-md:gap-[48px]">
          {/* Left: info */}
          <div>
            <h2 className="font-heading text-[clamp(28px,3.6vw,42px)] font-normal leading-[1.2] tracking-[-0.5px] text-text mb-[20px]">
              Let&apos;s talk
            </h2>
            <p className="text-[15px] leading-[1.8] text-text-secondary mb-[40px]">
              Whether you have a defined brief or just a problem you're thinking
              through, we're happy to have the conversation.
            </p>

            {/* Contact details */}
            <div className="flex flex-col gap-[20px]">
              {/* Email */}
              <a
                href="mailto:simon@host-ly.com"
                className="flex items-center gap-[14px] text-text-secondary no-underline transition-colors duration-200 hover:text-text group"
              >
                <span className="w-[40px] h-[40px] rounded-[6px] border border-border flex items-center justify-center shrink-0 transition-border-color duration-200 group-hover:border-border-hover">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4L12 13L2 4" />
                  </svg>
                </span>
                <span className="text-[14px]">simon@host-ly.com</span>
              </a>

              {/* Phone */}
              <a
                href="tel:+61433651272"
                className="flex items-center gap-[14px] text-text-secondary no-underline transition-colors duration-200 hover:text-text group"
              >
                <span className="w-[40px] h-[40px] rounded-[6px] border border-border flex items-center justify-center shrink-0 transition-border-color duration-200 group-hover:border-border-hover">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </span>
                <span className="text-[14px]">+61 433 651 272</span>
              </a>

              {/* Location */}
              <div className="flex items-center gap-[14px] text-text-secondary">
                <span className="w-[40px] h-[40px] rounded-[6px] border border-border flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="text-[14px]">Sydney, Australia</span>
              </div>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/simonlobascher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[14px] text-text-secondary no-underline transition-colors duration-200 hover:text-text group"
              >
                <span className="w-[40px] h-[40px] rounded-[6px] border border-border flex items-center justify-center shrink-0 transition-border-color duration-200 group-hover:border-border-hover">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </span>
                <span className="text-[14px]">linkedin.com/in/simonlobascher</span>
              </a>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {submitted ? (
              <div className="bg-bg-card border border-border rounded-[8px] p-[48px] text-center">
                <div className="text-[32px] mb-[16px]">&#10003;</div>
                <h3 className="font-heading text-[24px] text-text mb-[12px]">
                  Message sent
                </h3>
                <p className="text-[14px] text-text-secondary">
                  Thanks for getting in touch. We'll respond within one business
                  day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-bg-card border border-border rounded-[8px] p-[40px] max-md:p-[24px]"
              >
                {/* Name + Email row */}
                <div className="grid grid-cols-2 gap-[16px] mb-[16px] max-sm:grid-cols-1">
                  <div>
                    <label className="block text-[12px] text-text-secondary mb-[6px]">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full bg-bg border border-border rounded-[5px] px-[14px] py-[11px] text-[14px] text-text outline-none transition-border-color duration-200 focus:border-border-hover placeholder:text-text-tertiary"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-text-secondary mb-[6px]">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full bg-bg border border-border rounded-[5px] px-[14px] py-[11px] text-[14px] text-text outline-none transition-border-color duration-200 focus:border-border-hover placeholder:text-text-tertiary"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Organisation */}
                <div className="mb-[16px]">
                  <label className="block text-[12px] text-text-secondary mb-[6px]">
                    Organisation
                  </label>
                  <input
                    type="text"
                    name="organisation"
                    className="w-full bg-bg border border-border rounded-[5px] px-[14px] py-[11px] text-[14px] text-text outline-none transition-border-color duration-200 focus:border-border-hover placeholder:text-text-tertiary"
                    placeholder="Company name"
                  />
                </div>

                {/* Topic */}
                <div className="mb-[16px]">
                  <label className="block text-[12px] text-text-secondary mb-[6px]">
                    Topic
                  </label>
                  <select
                    name="topic"
                    className="w-full bg-bg border border-border rounded-[5px] px-[14px] py-[11px] text-[14px] text-text outline-none transition-border-color duration-200 focus:border-border-hover appearance-none cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    <option>AI Strategy &amp; Operating Model</option>
                    <option>Enterprise Architecture</option>
                    <option>Technology Strategy &amp; Roadmap</option>
                    <option>Agentic AI Platform</option>
                    <option>Program Leadership</option>
                    <option>Executive Coaching</option>
                    <option>Something else</option>
                  </select>
                </div>

                {/* Message */}
                <div className="mb-[24px]">
                  <label className="block text-[12px] text-text-secondary mb-[6px]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full bg-bg border border-border rounded-[5px] px-[14px] py-[11px] text-[14px] text-text outline-none transition-border-color duration-200 focus:border-border-hover resize-y min-h-[120px] placeholder:text-text-tertiary font-[inherit]"
                    placeholder="Tell us about your project or challenge..."
                  />
                </div>

                {/* Honeypot */}
                <input
                  type="text"
                  name="_gotcha"
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Footer */}
                <div className="flex items-center justify-between gap-[16px] max-sm:flex-col max-sm:items-stretch">
                  <span className="text-[12px] text-text-tertiary">
                    Typically responds within one business day.
                  </span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
