# Host-ly.com Landing Page

Corporate landing page for **Host-ly Co** -- enterprise AI strategy, architecture, and technology consulting.

**Live site:** [https://host-ly.com](https://host-ly.com)

---

## Architecture

This is a static HTML site with no build step. Everything is vanilla HTML, CSS, and JavaScript.

### File Structure

```
hostly-landing/
├── index.html              # Main landing page (all CSS/JS inline)
├── insights/               # Standalone article pages (~650 words each)
│   ├── ai-pilot-wont-scale.html
│   ├── cba-ai-strategy.html
│   ├── hybrid-ai-future.html
│   ├── mcp-enterprise-standard.html
│   ├── openai-openclaw.html
│   ├── openai-windsurf-acquisition.html
│   ├── physical-ai-industrial.html
│   ├── saaspocalypse-agent-licensing.html
│   └── vibe-coding-security.html
├── Dockerfile.dev          # Dev container for local preview
├── .github/
│   └── workflows/
│       └── deploy.yml      # Auto-deploy on push to main (pending PAT scope)
└── README.md
```

### Landing Page Sections

The `index.html` contains all sections with inline CSS and JS:

1. **Nav** -- fixed top bar with logo and CTA
2. **Hero** -- headline, subheading, email capture form
3. **Capabilities** -- 6-card grid (AI Strategy, Architecture, etc.)
4. **Insights** -- horizontal carousel with 9 clickable article cards
5. **Contact** -- email form and direct contact info
6. **Footer** -- copyright and nav links

### Insights Carousel

The insights section uses a custom carousel built with vanilla JS:

- Page-based navigation (prev/next arrows + dot indicators)
- Responsive breakpoints: 3 cards on desktop, 2 on tablet, 1 on mobile
- Touch/swipe support for mobile
- Each card links to a standalone article page in `insights/`

---

## Design System

| Token              | Value                          |
|--------------------|--------------------------------|
| Background         | `#0A0A0A`                      |
| Card background    | `#111111`                      |
| Card hover         | `#181818`                      |
| Text primary       | `#f0f0f0`                      |
| Text secondary     | `#888`                         |
| Accent (gold)      | `#D4A853`                      |
| Heading font       | EB Garamond                    |
| Body font          | Inter                          |
| Mono/tags font     | JetBrains Mono                 |

All fonts are loaded from Google Fonts. The accent colour (`#D4A853`, warm gold) is used for section dividers, tags, hover states, and form focus rings.

---

## Deployment

### Infrastructure

- **VPS:** `5.223.62.179` (Hetzner)
- **Web server:** [Caddy](https://caddyserver.com/) running on the host
- **CDN/DNS:** Cloudflare (proxied A record)
- **SSL:** Auto-managed by Caddy via Let's Encrypt

### Caddy Configuration

The Caddyfile on the VPS (`/etc/caddy/Caddyfile`) serves the static files:

```
host-ly.com, www.host-ly.com {
    root * /opt/hostly-landing
    encode gzip
    file_server
}
```

### Manual Deploy (SCP)

```bash
# From the project directory
scp -i ~/.ssh/deploy_key -r ./* root@5.223.62.179:/opt/hostly-landing/
```

Files are served directly from `/opt/hostly-landing/` on the VPS. No build step required.

### Automated Deploy (GitHub Actions)

A GitHub Actions workflow is configured in `.github/workflows/deploy.yml` that deploys on push to `main` using rsync over SSH.

**Required secrets** (already configured on the repo):
- `SERVER_IP` -- VPS IP address
- `SSH_PRIVATE_KEY` -- SSH private key for `root@` access

> **Note:** The workflow file has not been pushed yet because the GitHub PAT currently lacks the `workflow` scope. Once the PAT is updated, push the workflow and deploys will be automatic.

---

## Local Development

Run a local preview server using the dev container or any static file server:

```bash
# Option 1: npx serve
npx serve -l 3000 .

# Option 2: Python
python3 -m http.server 3000

# Option 3: Docker
docker build -f Dockerfile.dev -t hostly-dev .
docker run -p 3000:5173 hostly-dev
```

Then open [http://localhost:3000](http://localhost:3000).

> **Important:** Do not use the `-s` (single-page app) flag with `serve`. This site uses real file paths for article pages, and SPA mode will redirect article URLs back to `index.html`.

---

## Writing Style

Article content follows these conventions:

- Australian English spelling (organise, colour, analyse)
- No em dashes -- use double hyphens or restructure the sentence
- No bold text mid-paragraph
- Direct, conversational tone
- ~650 words per article
