# Host-ly.com Landing Page

Corporate landing page for **Host-ly Co** -- enterprise AI strategy, architecture, and technology consulting.

**Live site:** [https://host-ly.com](https://host-ly.com)

---

## Stack

- **React 19** + **TypeScript** + **Vite 6.4**
- **Tailwind CSS v4.2** (design tokens via `@theme`)
- **react-router-dom** (SPA with client-side routing)
- **Formspree** for contact form submission

### File Structure

```
hostly-landing/
├── index.html                          # Entry point (Google Fonts preconnect)
├── public/
│   └── images/                         # Stock photos (Unsplash)
├── src/
│   ├── main.tsx                        # React entry + BrowserRouter
│   ├── App.tsx                         # Routes (/, /insights/:slug, *)
│   ├── global.css                      # Design tokens, typography, buttons
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Nav.tsx                 # Fixed top nav with scroll effect
│   │   │   └── Footer.tsx              # Dark section footer
│   │   └── sections/
│   │       ├── Hero.tsx                # Headline + CTAs
│   │       ├── ClientLogos.tsx         # Scrolling logo carousel
│   │       ├── About.tsx               # Image + text side-by-side
│   │       ├── ImageCollage.tsx        # 4-image dynamic grid
│   │       ├── Capabilities.tsx        # 6-card grid (dark section)
│   │       ├── CaseStudies.tsx         # Case study cards
│   │       ├── Insights.tsx            # Article preview cards
│   │       └── Contact.tsx             # Contact form (dark section)
│   ├── data/
│   │   ├── articles.ts                 # Blog articles (slug, body HTML)
│   │   ├── capabilities.ts            # 6 service capabilities
│   │   ├── caseStudies.ts             # 6 case studies with outcomes
│   │   └── logos.ts                    # 9 client logos
│   ├── hooks/
│   │   ├── useActiveSection.ts        # IntersectionObserver section tracking
│   │   └── useScrollToSection.ts      # Cross-page scroll navigation
│   └── pages/
│       ├── HomePage.tsx                # Main landing page
│       ├── ArticlePage.tsx             # Individual article view
│       └── NotFoundPage.tsx            # 404 page
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile.dev                      # Dev container for local preview
```

### Page Flow

Hero (warm) → Client Logos → About → Image Collage → Capabilities (dark) → Case Studies → Insights → Contact (dark) → Footer (dark)

---

## Design System

| Token              | Value                          |
|--------------------|--------------------------------|
| Background         | `#F8F1E8` (warm cream)         |
| Dark sections      | `#2A2A2A` (charcoal)           |
| Card background    | `#FFFFFF`                      |
| Text primary       | `#2A2A2A`                      |
| Text secondary     | `#6B6B6B`                      |
| Accent (teal)      | `#00C9A7`                      |
| Heading font       | EB Garamond (serif)            |
| Body font          | Inter (sans-serif)             |
| Mono/tags font     | JetBrains Mono                 |

Fonts loaded from Google Fonts. The accent colour (`#00C9A7`, teal) is used for italic heading words, tags, hover states, and form focus rings. Buttons use pill shape (`border-radius: 100px`). Dark sections (Capabilities, Contact, Footer) use `.section-dark` class with inverted colours.

---

## Deployment

### Infrastructure

- **VPS:** `5.223.62.179` (Hetzner)
- **Web server:** [Caddy](https://caddyserver.com/) with `file_server` and SPA fallback
- **CDN/DNS:** Cloudflare (proxied A record)
- **SSL:** Auto-managed by Caddy via Let's Encrypt

### Caddy Configuration

```
host-ly.com, www.host-ly.com {
    root * /opt/hostly-landing
    encode gzip
    file_server
    try_files {path} /index.html
}
```

### Deploy

```bash
# Build
npx vite build

# Deploy to VPS
scp -i ~/.ssh/deploy_key -r dist/* root@5.223.62.179:/opt/hostly-landing/
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npx vite

# Type check
npx tsc --noEmit

# Production build
npx vite build
```

---

## Writing Style

Article content follows these conventions:

- Australian English spelling (organise, colour, analyse)
- No em dashes -- use double hyphens or restructure the sentence
- No bold text mid-paragraph
- Direct, conversational tone
- ~650 words per article
