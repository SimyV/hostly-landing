# Bashai.io Landing Page

Corporate landing page for **Bashai** -- enterprise AI strategy, architecture, and technology consulting.

**Live site:** [https://bashai.io](https://bashai.io)

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
│   │   │   └── Footer.tsx              # Orange accent footer
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
├── .claude/
│   ├── article-drafts/                 # Draft batches awaiting approval (JSON)
│   └── article-sources.json            # Curated links + followed publications
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile.dev                      # Dev container for local preview
```

### Page Flow

Hero (warm) → Client Logos → About → Image Collage → Capabilities (dark) → Case Studies → Insights → Contact (dark) → Footer (orange)

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
| Accent (orange)    | `#E8613C`                      |
| Heading font       | EB Garamond (serif)            |
| Body font          | Inter (sans-serif)             |
| Mono/tags font     | JetBrains Mono                 |

Fonts loaded from Google Fonts. Teal (`#00C9A7`) is used for italic heading words, tags, and hover states. Burnt orange (`#E8613C`) is used for CTA buttons, the footer background, alternating capability numbers, and case study metrics. Buttons use pill shape (`border-radius: 100px`). Capabilities and Contact use `.section-dark` class with inverted colours.

---

## Article Pipeline (Automated)

The site includes an automated article research and publishing pipeline with two input modes:

### Daily Research (Scheduled)

1. **Daily Research** (7am AEST, scheduled task) -- An AI agent searches for the latest AI, enterprise architecture, cybersecurity, and Australian tech news. It writes 3-5 draft articles (~650 words each).

2. **Email for Approval** -- Drafts are emailed to the editor with **Publish** and **Reject** buttons per article. The email includes full article previews styled in the site's design system.

3. **One-Click Publish** -- Clicking "Publish" in the email triggers the approval endpoint (`/api/articles/approve`), which:
   - Marks the article as approved in the draft batch JSON
   - Creates a one-time scheduled task that automatically:
     - Adds the article to `src/data/articles.ts`
     - Runs `npx vite build`
     - Deploys the built site to the VPS
     - Commits and pushes to GitHub

4. **Reject** -- Clicking "Reject" marks the article as rejected. No deployment occurs.

### WhatsApp Idea-to-Article (On-Demand)

Send a text message to the WhatsApp bot and get an article back in minutes:

1. **Send an idea** (e.g. "write about how Australian banks handle AI governance") via WhatsApp
2. Bot replies "Got it -- writing an article on..." immediately
3. An AI agent researches the topic, writes a ~650 word article, saves the draft batch, and emails it with Publish/Reject buttons
4. Bot sends a **WhatsApp notification** when the article is ready: "Your article is ready! Check your email for Publish/Reject buttons."
5. Same one-click Publish/Reject flow as daily articles

Alternatively, **send a URL** via WhatsApp to queue it as a curated source for the next daily research run.

### Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /whatsapp/webhook` | Receives WhatsApp messages (Meta Cloud API) |
| `GET /whatsapp/send?to=PHONE&message=TEXT` | Server-side WhatsApp message sender (used by agent tasks) |
| `GET /api/articles/approve?batch=TOKEN&id=ID` | Approves article, triggers publish task |
| `GET /api/articles/reject?batch=TOKEN&id=ID` | Rejects article |

### Key Files

| File | Purpose |
|------|---------|
| `src/data/articles.ts` | All published articles (slug, tag, title, excerpt, body HTML) |
| `.claude/article-drafts/*.json` | Draft batches with approval status per article |
| `.claude/article-sources.json` | Curated links (from WhatsApp) and followed publications |

### Article Format

Each article in `articles.ts` has:
- `slug` -- URL-friendly identifier (kebab-case)
- `tag` -- One of: AI Strategy, Industry, Architecture, Security, Delivery
- `date` -- Month and year (e.g. "Feb 2026")
- `readTime` -- Estimated read time (e.g. "4 min")
- `title`, `excerpt` -- Display metadata
- `body` -- Full HTML content with `<p>` and `<h2>` tags

### Draft Batch Format

```json
{
  "batchToken": "a1b2c3d4",
  "date": "2026-02-27",
  "articles": [
    {
      "id": "art_1",
      "status": "pending|approved|rejected",
      "slug": "article-slug",
      "tag": "AI Strategy",
      "title": "Article Title",
      "excerpt": "Short excerpt...",
      "readTime": "4 min",
      "body": "<p>Full HTML...</p>"
    }
  ]
}
```

---

## Deployment

Hosted on a VPS behind Cloudflare with Caddy as the web server (SPA fallback via `try_files`). SSL is auto-managed by Caddy via Let's Encrypt.

The site is deployed via Docker volume mounts from the agent-system container (see internal docs for credentials and paths).

```bash
# Build
npx vite build

# Deploy (automated via agent-system -- see internal docs)
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

---

Last updated: 2026-02-27
