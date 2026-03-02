# Plan: Harden Article Pipeline — Centralize Identity, Add Preflight Validation, Verify Side-Effects

## Context

The article pipeline (daily research, publish, remove) has been plagued by silent failures. The most recent: `ADMIN_USER_ID` env var pointed to the wrong user, so the WhatsApp "Remove" flow created a task under the wrong user — the task read from a non-existent path, couldn't find credentials, but still reported "success". No email was sent, no error was visible.

Root causes:
1. User identity is declared independently in 4 separate handlers — any one can drift
2. No preflight validation — tasks are created even when the underlying files/paths don't exist
3. Task prompts don't instruct Claude to verify side-effects or report failures

## Files to Modify

- **`memory-mcp/src/http-mcp-server.ts`** — all changes (new functions + refactor 4 handlers)
- **`docker-compose.prod.yml`** — add `HOSTLY_USER_ID` env var (line ~102)

## Step 1: Add `HOSTLY_USER_ID` env var to docker-compose.prod.yml

After line 102 (after `WHATSAPP_APP_SECRET`), add:

```yaml
HOSTLY_USER_ID: ${HOSTLY_USER_ID:-user_39rSuKJwrIsejlk4SRLlPcK5aSi}
```

This makes the identity configurable via env while keeping the correct fallback.

## Step 2: Add `getHostlyConfig()` function

Place after `getWhatsAppConfig()` (line ~17142), before the WhatsApp GET handler.

```typescript
interface HostlyConfig {
  userId: string;
  projectPath: string;
  articlesPath: string;
  sourcesPath: string;
  draftsDir: string;
  deployDockerPath: string;
}

function getHostlyConfig(): HostlyConfig {
  const userId = process.env.HOSTLY_USER_ID || 'user_39rSuKJwrIsejlk4SRLlPcK5aSi';
  const projectPath = `/storage/users/${userId}/projects/hostly-landing`;
  return {
    userId,
    projectPath,
    articlesPath: `${projectPath}/src/data/articles.ts`,
    sourcesPath: `${projectPath}/.claude/article-sources.json`,
    draftsDir: `${projectPath}/.claude/article-drafts`,
    deployDockerPath: `/root/agent-system/storage/users/${userId}/projects/hostly-landing`,
  };
}
```

## Step 3: Add `validateHostlyInvariants()` function

Place immediately after `getHostlyConfig()`.

```typescript
async function validateHostlyInvariants(): Promise<{ ok: boolean; errors: string[] }> {
  const config = getHostlyConfig();
  const errors: string[] = [];
  try { await access(config.projectPath); } catch { errors.push(`Project dir missing: ${config.projectPath}`); }
  try { await access(config.articlesPath); } catch { errors.push(`articles.ts missing: ${config.articlesPath}`); }
  return { ok: errors.length === 0, errors };
}
```

`access` is already imported (line 29). Deliberately lightweight — no credential checks (those require Convex round-trips on every request).

## Step 4: Refactor 4 handlers to use `getHostlyConfig()` + preflight

### 4a. `GET /articles/approve` (line ~16932)

- Remove: `const HOSTLY_USER_ID = 'user_39rSuKJwrIsejlk4SRLlPcK5aSi';`
- Add at top of try block: `const hostly = getHostlyConfig();` + preflight validation returning error HTML on failure
- Replace all `${HOSTLY_USER_ID}` with `hostly.userId`, `hostly.projectPath`, `hostly.articlesPath`, `hostly.deployDockerPath`
- Add FAILURE PROTOCOL to the publish prompt (WhatsApp notification on any step failure)

### 4b. `GET /articles/remove` (line ~17049)

- Remove: `const HOSTLY_USER_ID = ...;` and `const articlesPath = ...;`
- Add: `const hostly = getHostlyConfig();` + preflight validation
- Use `hostly.articlesPath` for the file read
- Replace all interpolations in `removePrompt` and task creation
- Add FAILURE PROTOCOL to the removal prompt

### 4c. `POST /whatsapp/webhook` — remove branch (line ~17178)

- Remove: `const HOSTLY_USER_ID = ...;`
- Add: `const hostly = getHostlyConfig();` + preflight validation
- On preflight failure: `sendWhatsAppReply(from, 'Cannot create removal list — config error: ...')` and return
- Replace all interpolations in `removalEmailPrompt` and task creation

### 4d. `POST /whatsapp/webhook` — URL branch (line ~17263)

- Remove: `const HOSTLY_USER_ID = ...;` and `const sourcesPath = ...;`
- Add: `const hostly = getHostlyConfig();`
- Use `hostly.sourcesPath` and `hostly.projectPath + '/.claude'` for mkdir
- No preflight needed here — just writes a JSON file, mkdir handles missing dirs

## Step 5: Add FAILURE PROTOCOL to all task prompts

Append to each task prompt (publish, remove, removal-email):

```
FAILURE PROTOCOL: If any step fails, immediately send a WhatsApp notification:
Tool: mcp__memory__automation
{"command": "http_request", "user_id": "${hostly.userId}", "http_url": "https://agent.host-ly.com/api/whatsapp/send?to=61433651272&message=PIPELINE FAILED: [step] — [error]", "http_method": "GET"}
Then stop. Do not proceed to later steps.
```

Also add per-step verification where appropriate:
- After `npx vite build`: check exit code
- After Docker deploy: verify `/opt/hostly-landing/index.html` exists
- After `git push`: verify with `git log --oneline -1 origin/main`
- After email send: check HTTP response status

## Step 6: Push to GitHub

Commit and push to `origin/master`. User rebuilds container.

## Verification

1. After rebuild, call `GET /articles/remove?slug=nonexistent-slug` — should return "Article Not Found" HTML (proves path resolution works)
2. Call `GET /articles/remove?slug=aeternum-c2-blockchain-botnet-untakeable-infrastructure` — should return "Article Being Removed" and create a task under `user_39rSuKJwrIsejlk4SRLlPcK5aSi` (check via `list_schedules`)
3. Send "Remove" on WhatsApp — should get "Check your email" reply and a removal email task under the correct user
4. Verify the task prompt in the created task contains correct paths (not `user_37mxm...`)
