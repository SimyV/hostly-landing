# Plan: Domain Migration — host-ly.com → bashai.io

**Date created:** 2026-03-02
**Scope:** Everything linked to host-ly.com, including DNS, subdomains, email, codebase, article pipeline, and the agent system.

---

## Summary

Migrate all infrastructure and code from `host-ly.com` to `bashai.io`. This covers:
- DNS records in Namecheap for bashai.io
- VPS Caddy config (subdomains: agent, manage, log, www, apex)
- Landing page codebase (source code, insight HTML files)
- Email address (hello@host-ly.com → hello@bashai.io)
- Agent system environment variables and pipeline config
- Formspree (contact form endpoint)
- GitHub repository references

---

## Phase 1: DNS — Namecheap (bashai.io)

> **Do this before anything else.** DNS propagation takes up to 48h. Start it first so it's ready by the time other steps are done.

Log into Namecheap → Manage `bashai.io` → Advanced DNS → Add the following records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `5.223.62.179` | Automatic |
| A | www | `5.223.62.179` | Automatic |
| A | agent | `5.223.62.179` | Automatic |
| A | manage | `5.223.62.179` | Automatic |
| A | log | `5.223.62.179` | Automatic |

> **Note:** These mirror what host-ly.com currently has. Confirm with `ping host-ly.com` first to verify the VPS IP is `5.223.62.179`.

**Email MX records** — if hello@host-ly.com is Microsoft 365:

| Type | Host | Value | Priority | TTL |
|------|------|-------|----------|-----|
| MX | @ | (your M365 MX record, e.g. `bashai-io.mail.protection.outlook.com`) | 0 | Automatic |
| TXT | @ | `v=spf1 include:spf.protection.outlook.com -all` | — | Automatic |
| CNAME | autodiscover | `autodiscover.outlook.com` | — | Automatic |

> **Check first:** Go to Namecheap → host-ly.com → Advanced DNS and note all existing MX/TXT/CNAME records. Replicate them on bashai.io with the new domain name.

---

## Phase 2: VPS — Caddy Config

> SSH into the VPS directly (not via agent — no SSH key in container).

**Step 2.1:** SSH to VPS:
```
ssh root@5.223.62.179
```

**Step 2.2:** Edit `/etc/caddy/Caddyfile`. The current config for host-ly.com looks like:

```
host-ly.com, www.host-ly.com {
    root * /opt/hostly-landing
    encode gzip
    file_server
}

agent.host-ly.com {
    reverse_proxy localhost:PORT  # or nginx
}

manage.host-ly.com { ... }
log.host-ly.com { ... }
```

**Add equivalent blocks for bashai.io** (keep host-ly.com blocks active during transition):

```
bashai.io, www.bashai.io {
    root * /opt/hostly-landing
    encode gzip
    file_server
}

agent.bashai.io {
    # same reverse_proxy as agent.host-ly.com
}

manage.bashai.io {
    # same reverse_proxy as manage.host-ly.com
}

log.bashai.io {
    # same reverse_proxy as log.host-ly.com
}
```

**Step 2.3:** Reload Caddy:
```
caddy reload --config /etc/caddy/Caddyfile
```

**Step 2.4:** Test each URL once DNS propagates:
- https://bashai.io
- https://www.bashai.io
- https://agent.bashai.io
- https://manage.bashai.io

> **Keep host-ly.com in Caddy** until you're sure everything works on bashai.io. Then optionally add a redirect:
> ```
> host-ly.com, www.host-ly.com {
>     redir https://bashai.io{uri} permanent
> }
> ```

---

## Phase 3: Email — hello@bashai.io

**Step 3.1:** Add bashai.io as a domain in Microsoft 365 Admin:
- Go to Microsoft 365 Admin Center → Settings → Domains → Add domain → `bashai.io`
- Follow the verification wizard (adds a TXT record to Namecheap)
- Add MX records as prompted

**Step 3.2:** Create `hello@bashai.io` mailbox (or alias from existing hello@host-ly.com account)

**Step 3.3:** Update the Azure App Registration (used for email sending via MS Graph):
- Add `bashai.io` as allowed sender domain if required
- Update MS_REFRESH_TOKEN if the token is scoped to a specific UPN

**Step 3.4:** Update the stored credential for the reply-to / from address in any pipeline email templates that hardcode `hello@host-ly.com`.

---

## Phase 4: Codebase — Source Code Changes

> Run these as code changes, build, deploy.

### 4.1 — Contact.tsx (email address)

File: `src/components/sections/Contact.tsx` lines ~54, 58

Change:
- `mailto:hello@host-ly.com` → `mailto:hello@bashai.io`
- `hello@host-ly.com` display text → `hello@bashai.io`

### 4.2 — Insight HTML files (9 files)

All 9 files in `insights/` directory contain two links each:
- `https://agent.host-ly.com` → `https://agent.bashai.io`
- `https://manage.host-ly.com` → `https://manage.bashai.io`

Files to update:
1. `insights/ai-pilot-wont-scale.html`
2. `insights/cba-ai-strategy.html`
3. `insights/hybrid-ai-future.html`
4. `insights/mcp-enterprise-standard.html`
5. `insights/openai-openclaw.html`
6. `insights/openai-windsurf-acquisition.html`
7. `insights/physical-ai-industrial.html`
8. `insights/saaspocalypse-agent-licensing.html`
9. `insights/vibe-coding-security.html`

### 4.3 — package.json

File: `package.json`
- `"name": "hostly-landing"` — can stay (internal identifier, not visible)
- `"description"` — update if it mentions "Host-ly Co" → "Bashai"

### 4.4 — README.md

File: `README.md` line 5
- Update `https://host-ly.com` → `https://bashai.io`

### 4.5 — Formspree (Contact Form)

The current form endpoint `https://formspree.io/f/mkovyrnp` is account-tied, not domain-tied — it will continue to work regardless of domain. **No change needed here**, but optionally:
- Log into Formspree and update the project name/email notification to hello@bashai.io

---

## Phase 5: Article Pipeline — Agent System

> These are environment variables and config values inside the memory-mcp container. Changes require a container rebuild.

**Step 5.1:** Identify all hardcoded host-ly.com references in agent-system source:

Key locations in `http-mcp-server.ts` and pipeline files:
- WhatsApp webhook send URL: `https://agent.host-ly.com/api/whatsapp/send`
- Any hardcoded email from/reply-to using `hello@host-ly.com`
- Any `agent.host-ly.com` used as the base URL for approval links in emails
- Plan file: `.claude/plans/linked-gathering-engelbart.md` line 109 (references `agent.host-ly.com`)

**Step 5.2:** Update agent-system source in GitHub:
- Clone https://github.com/SimyV/agent-system
- Find and replace `host-ly.com` → `bashai.io` in relevant files
- Push to master branch
- SSH to VPS and rebuild the container:
  ```
  cd /root/agent-system
  git pull
  docker compose -f docker-compose.prod.yml up -d --build memory-mcp
  ```

**Step 5.3:** Update `.claude/plans/linked-gathering-engelbart.md` in this repo if it contains live pipeline references.

---

## Phase 6: Future Article HTML Templates

> New articles generated by the pipeline will use whatever base URL is hardcoded in the template generator inside `http-mcp-server.ts`. Once Phase 5 is done, new articles will automatically use `bashai.io`. **Existing articles** in `insights/` are updated manually in Phase 4.2.

---

## Phase 7: Build & Deploy

Once all source code changes are made:

```bash
# In the hostly-landing project directory
npx vite build

# Deploy via Docker (DOCKER_HOST already set)
docker run --rm \
  -v /root/agent-system/storage/users/user_39rSuKJwrIsejlk4SRLlPcK5aSi/projects/hostly-landing/dist:/src:ro \
  -v /opt/hostly-landing:/dest \
  alpine sh -c 'cp -r /src/* /dest/'
```

Then commit and push:
```bash
git add -A
git commit -m "rebrand: migrate domain from host-ly.com to bashai.io"
git push origin main
```

---

## Phase 8: Post-Migration Verification Checklist

- [ ] https://bashai.io loads correctly
- [ ] https://www.bashai.io loads correctly
- [ ] https://agent.bashai.io loads (agent platform)
- [ ] https://manage.bashai.io loads (manage interface)
- [ ] Contact form mailto link shows hello@bashai.io
- [ ] Contact form submits successfully (Formspree)
- [ ] Email to hello@bashai.io is received in M365 mailbox
- [ ] Email sent from pipeline uses hello@bashai.io as from address
- [ ] Article approval links in emails use agent.bashai.io
- [ ] WhatsApp notification flow uses agent.bashai.io URLs
- [ ] All 9 insight HTML files show agent.bashai.io / manage.bashai.io links
- [ ] Old host-ly.com either redirects or still works in parallel

---

## Phase 9: Cleanup (after confirmed working)

- Remove host-ly.com blocks from Caddy (or convert to permanent redirects)
- Optionally keep host-ly.com DNS for 6–12 months for redirect continuity
- Archive or deprecate hello@host-ly.com mailbox

---

## Order of Operations Summary

```
1. DNS (Namecheap)       — do first, propagation takes time
2. VPS Caddy config      — add bashai.io blocks (keep host-ly.com running)
3. M365 email setup      — add bashai.io domain, create hello@bashai.io
4. Code changes          — Contact.tsx, insight HTMLs, README
5. Agent system updates  — clone, edit, push, rebuild container
6. Build + Deploy        — vite build + docker copy
7. Verify checklist      — test everything
8. Cleanup               — convert host-ly.com to redirect
```

---

## Notes & Risks

- **DNS propagation**: Can take up to 48h. Plan around this.
- **Caddy TLS**: Caddy auto-provisions Let's Encrypt certs for new domains. This requires DNS to be pointing to the VPS first.
- **M365 licensing**: Adding bashai.io as a domain to M365 is free if you already have a subscription. Verify before assuming.
- **MS Graph token**: If the refresh token is tied to a UPN that includes host-ly.com (e.g. `hello@host-ly.com`), the token will stop working once that mailbox is gone. Create hello@bashai.io first and get a new refresh token before decommissioning the old mailbox.
- **Formspree**: No change needed — it's identified by form ID, not domain.
- **GitHub repo**: The repo at https://github.com/SimyV/hostly-landing can be renamed to `bashai-landing` via GitHub → Settings → Repository name. Update the remote in local git config after:
  ```
  git remote set-url origin https://github.com/SimyV/bashai-landing.git
  ```
