/**
 * Pipeline Event Tracking System
 *
 * Provides structured event logging with SSE broadcasting for
 * real-time visibility into article pipeline operations.
 *
 * Includes a pipeline plan/checklist system that shows expected steps
 * upfront and ticks them off as they complete.
 */

export interface PipelineEvent {
  id: string;
  timestamp: number;
  stage: string;       // e.g. 'whatsapp', 'task-scheduler', 'claude-cli', 'email', 'deploy'
  event: string;       // e.g. 'remove-request', 'task-created', 'tool-use', 'email-sent'
  message: string;     // Human-readable description
  detail?: string;     // Short summary shown inline
  fullDetail?: string; // Full detail shown when expanded (tool input JSON, full response, etc.)
  level: 'info' | 'warn' | 'error' | 'success';
  pipelineId?: string; // Groups events belonging to the same pipeline run
}

// --- Pipeline Plan/Checklist System ---

export interface PipelineStep {
  id: string;
  label: string;
  estimatedSeconds?: number;
  status: 'pending' | 'active' | 'done' | 'failed' | 'skipped';
  startedAt?: number;
  completedAt?: number;
  detail?: string;
  phase?: string;  // Phase group label for visual grouping in the UI
}

export interface PipelinePlan {
  pipelineId: string;
  type: string;         // e.g. 'article-removal', 'article-publish'
  title: string;
  startedAt: number;
  steps: PipelineStep[];
  status: 'running' | 'completed' | 'failed';
}

// Step with optional phase grouping
interface StepTemplate { id: string; label: string; est?: number; phase?: string }

// Predefined step templates for each pipeline type
const PIPELINE_TEMPLATES: Record<string, { title: string; steps: StepTemplate[] }> = {
  // --- Removal pipelines ---

  'removal-email': {
    title: 'Send Removal Email',
    steps: [
      { id: 'email-task-start', label: 'Task picked up by scheduler', est: 10 },
      { id: 'email-spawn-cli', label: 'Spawn Claude CLI agent', est: 5 },
      { id: 'email-read-articles', label: 'Read articles.ts', est: 5 },
      { id: 'email-build-email', label: 'Build email HTML with Remove buttons', est: 15 },
      { id: 'email-oauth-token', label: 'Refresh OAuth token', est: 10 },
      { id: 'email-store-creds', label: 'Store access token as credential', est: 5 },
      { id: 'email-send-email', label: 'Send email via Graph API', est: 10 },
      { id: 'email-whatsapp-confirm', label: 'Send WhatsApp confirmation', est: 5 },
      { id: 'email-task-complete', label: 'Task completed', est: 2 },
    ],
  },
  // Master removal pipeline: WhatsApp request + email sending (phases 1-2 only)
  // Phases 3-4 (click + execute) are tracked by a separate 'code-removal' pipeline
  'full-removal': {
    title: 'Article Removal Pipeline',
    steps: [
      // Phase 1: WhatsApp request
      { id: 'receive', label: 'Receive WhatsApp message', est: 1, phase: 'WhatsApp Request' },
      { id: 'preflight', label: 'Preflight validation', est: 1, phase: 'WhatsApp Request' },
      { id: 'email-read-articles', label: 'Read articles for email', est: 3, phase: 'WhatsApp Request' },
      { id: 'email-build-email', label: 'Build email HTML', est: 5, phase: 'WhatsApp Request' },
      { id: 'create-task', label: 'Create email task', est: 2, phase: 'WhatsApp Request' },
      { id: 'reply', label: 'Send WhatsApp reply', est: 2, phase: 'WhatsApp Request' },
      // Phase 2: Email sending (Claude CLI task)
      { id: 'email-task-start', label: 'Task picked up by scheduler', est: 10, phase: 'Send Removal Email' },
      { id: 'email-spawn-cli', label: 'Spawn Claude CLI agent', est: 5, phase: 'Send Removal Email' },
      { id: 'email-oauth-token', label: 'Refresh OAuth token', est: 10, phase: 'Send Removal Email' },
      { id: 'email-store-creds', label: 'Store access token as credential', est: 5, phase: 'Send Removal Email' },
      { id: 'email-send-email', label: 'Send email via Graph API', est: 10, phase: 'Send Removal Email' },
      { id: 'email-whatsapp-confirm', label: 'Send WhatsApp confirmation', est: 5, phase: 'Send Removal Email' },
      { id: 'email-task-complete', label: 'Task completed', est: 2, phase: 'Send Removal Email' },
    ],
  },
  // Code-based removal execution (called from /articles/remove endpoint)
  'code-removal': {
    title: 'Execute Article Removal',
    steps: [
      { id: 'rm-git-pull', label: 'Git pull --rebase', est: 10 },
      { id: 'rm-edit-articles', label: 'Remove from articles.ts', est: 5 },
      { id: 'rm-build', label: 'Vite build', est: 30 },
      { id: 'rm-deploy', label: 'Deploy via Docker', est: 15 },
      { id: 'rm-git-push', label: 'Git commit + push', est: 10 },
    ],
  },

  // --- Publish pipelines ---

  // Approval phase (from /articles/approve endpoint)
  'batch-publish': {
    title: 'Batch Publish (Approval)',
    steps: [
      { id: 'pub-approve-click', label: 'Approve button clicked', est: 1 },
      { id: 'pub-preflight', label: 'Preflight validation', est: 1 },
      { id: 'pub-create-task', label: 'Schedule publish (90s batch window)', est: 2 },
    ],
  },
  // Code-based publish execution (called from publishApprovedArticles)
  'code-publish': {
    title: 'Publish Articles',
    steps: [
      { id: 'pub-read-batch', label: 'Read batch file', est: 5 },
      { id: 'pub-git-pull', label: 'Git pull --rebase', est: 10 },
      { id: 'pub-edit-articles', label: 'Insert into articles.ts', est: 5 },
      { id: 'pub-build', label: 'Vite build', est: 30 },
      { id: 'pub-deploy', label: 'Deploy via Docker', est: 15 },
      { id: 'pub-git-push', label: 'Git commit + push', est: 10 },
    ],
  },

  // --- Article generation pipelines ---

  // WhatsApp idea → Claude writes article → post-processing saves/emails
  'adhoc-article': {
    title: 'Article from WhatsApp Idea',
    steps: [
      // Phase 1: WhatsApp intake
      { id: 'idea-receive', label: 'Receive WhatsApp idea', est: 1, phase: 'WhatsApp Intake' },
      { id: 'idea-create-task', label: 'Create article task', est: 2, phase: 'WhatsApp Intake' },
      { id: 'idea-reply', label: 'Send WhatsApp reply', est: 2, phase: 'WhatsApp Intake' },
      // Phase 2: Claude writes article (Claude CLI task)
      { id: 'idea-task-start', label: 'Task picked up by scheduler', est: 10, phase: 'Generate Article' },
      { id: 'idea-spawn-cli', label: 'Spawn Claude CLI agent', est: 5, phase: 'Generate Article' },
      { id: 'idea-read-sources', label: 'Read article sources', est: 5, phase: 'Generate Article' },
      { id: 'idea-research', label: 'Web research', est: 30, phase: 'Generate Article' },
      { id: 'idea-write', label: 'Write article JSON', est: 60, phase: 'Generate Article' },
      { id: 'idea-task-complete', label: 'Claude task completed', est: 2, phase: 'Generate Article' },
      // Phase 3: Post-processing (code, not Claude)
      { id: 'idea-save-batch', label: 'Save batch file', est: 3, phase: 'Send for Approval' },
      { id: 'idea-send-email', label: 'Send approval email', est: 10, phase: 'Send for Approval' },
      { id: 'idea-whatsapp-notify', label: 'Send WhatsApp notification', est: 5, phase: 'Send for Approval' },
    ],
  },
  // Daily cron article research → Claude writes articles → post-processing saves/emails
  'daily-article': {
    title: 'Daily Article Research',
    steps: [
      // Phase 1: Claude writes articles (Claude CLI task)
      { id: 'da-task-start', label: 'Task picked up by scheduler', est: 10, phase: 'Generate Articles' },
      { id: 'da-spawn-cli', label: 'Spawn Claude CLI agent', est: 5, phase: 'Generate Articles' },
      { id: 'da-read-sources', label: 'Read article sources', est: 5, phase: 'Generate Articles' },
      { id: 'da-web-research', label: 'Web research', est: 60, phase: 'Generate Articles' },
      { id: 'da-write-articles', label: 'Write article JSON', est: 120, phase: 'Generate Articles' },
      { id: 'da-task-complete', label: 'Claude task completed', est: 2, phase: 'Generate Articles' },
      // Phase 2: Post-processing (code, not Claude)
      { id: 'da-save-batch', label: 'Save batch file', est: 3, phase: 'Send for Approval' },
      { id: 'da-send-email', label: 'Send approval email', est: 10, phase: 'Send for Approval' },
      { id: 'da-whatsapp-notify', label: 'Send WhatsApp notification', est: 5, phase: 'Send for Approval' },
    ],
  },

  // --- URL reference pipeline ---

  'url-reference': {
    title: 'Save URL Reference',
    steps: [
      { id: 'url-receive', label: 'Receive WhatsApp URLs', est: 1 },
      { id: 'url-load-sources', label: 'Load existing sources', est: 3 },
      { id: 'url-dedup', label: 'Deduplicate URLs', est: 2 },
      { id: 'url-save', label: 'Save to sources file', est: 3 },
      { id: 'url-reply', label: 'Send WhatsApp reply', est: 2 },
    ],
  },
};

const activePlans: Map<string, PipelinePlan> = new Map();
const recentPlans: PipelinePlan[] = []; // Keep last 20 completed plans
const MAX_RECENT_PLANS = 20;

/**
 * Start a new pipeline with a predefined plan.
 * Returns the plan so callers can reference steps.
 */
export function startPipeline(pipelineId: string, type: string): PipelinePlan | null {
  const template = PIPELINE_TEMPLATES[type];
  if (!template) {
    console.warn(`[Pipeline] Unknown pipeline type: ${type}`);
    return null;
  }

  const plan: PipelinePlan = {
    pipelineId,
    type,
    title: template.title,
    startedAt: Date.now(),
    status: 'running',
    steps: template.steps.map(s => ({
      id: s.id,
      label: s.label,
      estimatedSeconds: s.est,
      status: 'pending' as const,
      phase: s.phase,
    })),
  };

  activePlans.set(pipelineId, plan);
  broadcastPlanUpdate(plan);
  return plan;
}

/**
 * Complete (tick off) a step in a pipeline plan.
 */
export function completePipelineStep(
  pipelineId: string,
  stepId: string,
  status: 'done' | 'failed' | 'skipped' = 'done',
  detail?: string
): void {
  const plan = activePlans.get(pipelineId);
  if (!plan) return;

  const step = plan.steps.find(s => s.id === stepId);
  if (!step) return;

  step.status = status;
  step.completedAt = Date.now();
  if (detail) step.detail = detail;

  // Auto-activate next pending step within the same phase only.
  // Cross-phase activation is handled by the code that starts each phase.
  const stepIdx = plan.steps.indexOf(step);
  const nextStep = stepIdx >= 0 ? plan.steps[stepIdx + 1] : null;
  if (nextStep && nextStep.status === 'pending' && (!step.phase || nextStep.phase === step.phase)) {
    nextStep.status = 'active';
    nextStep.startedAt = Date.now();
  }

  // Check if pipeline is complete
  const allDone = plan.steps.every(s => s.status === 'done' || s.status === 'failed' || s.status === 'skipped');
  if (allDone) {
    const hasFailed = plan.steps.some(s => s.status === 'failed');
    plan.status = hasFailed ? 'failed' : 'completed';
    activePlans.delete(pipelineId);
    recentPlans.push(plan);
    if (recentPlans.length > MAX_RECENT_PLANS) recentPlans.shift();
  }

  broadcastPlanUpdate(plan);
}

/**
 * Mark a step as active (in progress).
 */
export function activatePipelineStep(pipelineId: string, stepId: string): void {
  const plan = activePlans.get(pipelineId);
  if (!plan) return;

  const step = plan.steps.find(s => s.id === stepId);
  if (!step) return;

  step.status = 'active';
  step.startedAt = Date.now();
  broadcastPlanUpdate(plan);
}

/**
 * Fail an entire pipeline (marks all remaining steps as skipped).
 */
export function failPipeline(pipelineId: string, reason: string): void {
  const plan = activePlans.get(pipelineId);
  if (!plan) return;

  plan.status = 'failed';
  for (const step of plan.steps) {
    if (step.status === 'pending' || step.status === 'active') {
      step.status = 'skipped';
      step.detail = reason;
    }
  }
  activePlans.delete(pipelineId);
  recentPlans.push(plan);
  if (recentPlans.length > MAX_RECENT_PLANS) recentPlans.shift();
  broadcastPlanUpdate(plan);
}

/**
 * Get all active pipeline plans.
 */
export function getActivePlans(): PipelinePlan[] {
  return Array.from(activePlans.values());
}

/**
 * Find an active master pipeline of a given type.
 * Used by downstream phases to attach to an existing full-removal pipeline.
 */
export function findActivePipeline(type: string): PipelinePlan | null {
  for (const plan of activePlans.values()) {
    if (plan.type === type) return plan;
  }
  return null;
}

/**
 * Get recently completed plans.
 */
export function getRecentPlans(): PipelinePlan[] {
  return [...recentPlans];
}

/**
 * Reset all state — clears events, plans, and notifies SSE clients.
 */
export function resetPipelineState(): void {
  events.length = 0;
  eventCounter = 0;
  activePlans.clear();
  recentPlans.length = 0;
  // Notify all SSE clients to reset
  const data = JSON.stringify({ type: 'reset' });
  for (let i = clients.length - 1; i >= 0; i--) {
    try {
      clients[i].res.write(`data: ${data}\n\n`);
    } catch {
      clients.splice(i, 1);
    }
  }
}

function broadcastPlanUpdate(plan: PipelinePlan): void {
  const data = JSON.stringify({ type: 'plan-update', plan });
  for (let i = clients.length - 1; i >= 0; i--) {
    try {
      clients[i].res.write(`data: ${data}\n\n`);
    } catch {
      clients.splice(i, 1);
    }
  }
}

// --- Event System ---

type SSEClient = {
  id: string;
  res: any; // Express Response with SSE
};

const MAX_EVENTS = 500;
const events: PipelineEvent[] = [];
const clients: SSEClient[] = [];
let eventCounter = 0;

/**
 * Emit a pipeline event. Stores in ring buffer and broadcasts to all SSE clients.
 */
export function emitPipelineEvent(
  stage: string,
  event: string,
  message: string,
  opts?: { detail?: string; fullDetail?: string; level?: PipelineEvent['level']; pipelineId?: string }
): PipelineEvent {
  const ev: PipelineEvent = {
    id: `pe_${++eventCounter}`,
    timestamp: Date.now(),
    stage,
    event,
    message,
    detail: opts?.detail,
    fullDetail: opts?.fullDetail,
    level: opts?.level || 'info',
    pipelineId: opts?.pipelineId,
  };

  events.push(ev);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }

  // Broadcast to SSE clients
  const data = JSON.stringify(ev);
  for (let i = clients.length - 1; i >= 0; i--) {
    try {
      clients[i].res.write(`data: ${data}\n\n`);
    } catch {
      clients.splice(i, 1);
    }
  }

  // Also log to console for docker logs
  const tag = `[Pipeline:${stage}]`;
  if (ev.level === 'error') {
    console.error(`${tag} ${message}${ev.detail ? ' | ' + ev.detail.slice(0, 200) : ''}`);
  } else {
    console.log(`${tag} ${message}${ev.detail ? ' | ' + ev.detail.slice(0, 200) : ''}`);
  }

  return ev;
}

/**
 * Get recent events, optionally filtered by pipelineId.
 */
export function getRecentEvents(limit = 100, pipelineId?: string): PipelineEvent[] {
  let filtered = pipelineId ? events.filter(e => e.pipelineId === pipelineId) : events;
  return filtered.slice(-limit);
}

/**
 * Generate a pipeline ID for grouping related events.
 */
export function generatePipelineId(): string {
  return `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Register an SSE client. Returns a cleanup function.
 */
export function registerSSEClient(res: any): () => void {
  const client: SSEClient = { id: `sse_${Date.now()}`, res };
  clients.push(client);

  return () => {
    const idx = clients.indexOf(client);
    if (idx !== -1) clients.splice(idx, 1);
  };
}

/**
 * Get the status dashboard HTML page.
 */
export function getStatusDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hostly Pipeline Status</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
      background: #1a1a2e;
      color: #e0e0e0;
      padding: 20px;
      min-height: 100vh;
    }
    h1 {
      font-family: 'EB Garamond', Georgia, serif;
      color: #00C9A7;
      margin-bottom: 4px;
      font-size: 24px;
    }
    .subtitle {
      color: #666;
      font-size: 12px;
      margin-bottom: 20px;
    }
    .connection-status {
      position: fixed;
      top: 12px;
      right: 20px;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 100px;
      background: #2a2a3e;
      z-index: 100;
    }
    .connection-status.connected { color: #00C9A7; border: 1px solid #00C9A7; }
    .connection-status.disconnected { color: #E8613C; border: 1px solid #E8613C; }
    .connection-status.connecting { color: #f0c040; border: 1px solid #f0c040; }

    /* Pipeline checklist panel */
    .plans-container {
      margin-bottom: 20px;
    }
    .plan-card {
      background: #16162a;
      border: 1px solid #2a2a3e;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 10px;
      animation: slideIn 0.3s ease-out;
    }
    .plan-card.completed { border-color: #00C9A7; }
    .plan-card.failed { border-color: #E8613C; }
    .plan-card.running { border-color: #4a90d9; }
    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .plan-title {
      font-size: 14px;
      font-weight: 600;
      color: #e0e0e0;
    }
    .plan-badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .plan-badge.running { background: #4a90d933; color: #4a90d9; }
    .plan-badge.completed { background: #00C9A733; color: #00C9A7; }
    .plan-badge.failed { background: #E8613C33; color: #E8613C; }
    .plan-progress {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .plan-progress-bar {
      flex: 1;
      height: 4px;
      background: #2a2a3e;
      border-radius: 2px;
      overflow: hidden;
    }
    .plan-progress-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.5s ease;
    }
    .plan-progress-fill.running { background: #4a90d9; }
    .plan-progress-fill.completed { background: #00C9A7; }
    .plan-progress-fill.failed { background: #E8613C; }
    .plan-progress-text {
      font-size: 10px;
      color: #666;
      white-space: nowrap;
    }
    .plan-elapsed {
      font-size: 10px;
      color: #555;
      margin-bottom: 10px;
    }
    .plan-steps {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .plan-step {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .plan-step.active {
      background: #4a90d915;
    }
    .step-icon {
      width: 18px;
      text-align: center;
      flex-shrink: 0;
      font-size: 13px;
    }
    .step-icon.pending { color: #444; }
    .step-icon.active { color: #4a90d9; }
    .step-icon.done { color: #00C9A7; }
    .step-icon.failed { color: #E8613C; }
    .step-icon.skipped { color: #555; }
    .step-label { color: #999; flex: 1; }
    .step-label.active { color: #e0e0e0; }
    .step-label.done { color: #888; }
    .step-label.failed { color: #E8613C; }
    .step-label.skipped { color: #555; text-decoration: line-through; }
    .step-times {
      display: flex;
      gap: 6px;
      align-items: center;
      white-space: nowrap;
    }
    .step-time {
      font-size: 10px;
      color: #888;
    }
    .step-time.slow { color: #f0c040; }
    .step-time.fast { color: #00C9A7; }
    .step-est {
      font-size: 9px;
      color: #444;
    }
    .step-detail {
      font-size: 10px;
      color: #666;
      margin-left: 26px;
    }
    .phase-header {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #555;
      padding: 8px 8px 2px;
      margin-top: 6px;
      border-top: 1px solid #2a2a3e;
    }
    .phase-header:first-child {
      margin-top: 0;
      border-top: none;
    }
    .phase-header.phase-active { color: #4a90d9; }
    .phase-header.phase-done { color: #00C9A7; }
    .phase-header.phase-failed { color: #E8613C; }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinner {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
    .no-plans {
      color: #333;
      font-size: 11px;
      text-align: center;
      padding: 8px;
    }

    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 16px;
      border-bottom: 1px solid #2a2a3e;
    }
    .tab-btn {
      background: transparent;
      color: #666;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 8px 20px;
      font-size: 12px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: #ccc; }
    .tab-btn.active { color: #00C9A7; border-bottom-color: #00C9A7; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* Tasks tab */
    .tasks-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .tasks-table th {
      text-align: left;
      color: #666;
      padding: 6px 10px;
      border-bottom: 1px solid #2a2a3e;
      font-weight: 600;
    }
    .tasks-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #16162a;
      color: #999;
    }
    .tasks-table tr:hover td { background: #16162a; }
    .task-status {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 600;
    }
    .task-status.running { background: #4a90d933; color: #4a90d9; }
    .task-status.idle { background: #33333355; color: #888; }
    .task-status.completed { background: #00C9A733; color: #00C9A7; }
    .task-status.failed { background: #E8613C33; color: #E8613C; }
    .task-status.error { background: #E8613C33; color: #E8613C; }
    .task-enabled { color: #00C9A7; }
    .task-disabled { color: #555; }
    .tasks-summary {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 11px;
    }
    .tasks-summary .stat { color: #666; }
    .tasks-summary .stat strong { color: #ccc; }
    .tasks-summary .stat.warn strong { color: #f0c040; }
    .tasks-summary .stat.danger strong { color: #E8613C; }
    .tasks-refresh {
      background: #2a2a3e;
      color: #666;
      border: 1px solid #333;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 10px;
      cursor: pointer;
      font-family: inherit;
      margin-left: auto;
    }
    .tasks-refresh:hover { border-color: #00C9A7; color: #00C9A7; }
    .events {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .event {
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.5;
      background: #16162a;
      border-left: 3px solid transparent;
      animation: slideIn 0.2s ease-out;
      cursor: pointer;
      transition: background 0.15s;
    }
    .event:hover { background: #1e1e38; }
    .event.selected { background: #1e1e38; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .event.info { border-left-color: #4a90d9; }
    .event.warn { border-left-color: #f0c040; }
    .event.error { border-left-color: #E8613C; }
    .event.success { border-left-color: #00C9A7; }
    .event-row {
      display: grid;
      grid-template-columns: 70px 110px 1fr;
      gap: 12px;
      padding: 6px 12px;
    }
    .event-time { color: #666; white-space: nowrap; }
    .event-stage {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stage-whatsapp { color: #25D366; }
    .stage-task-scheduler { color: #4a90d9; }
    .stage-claude-cli { color: #d4a574; }
    .stage-email { color: #c084fc; }
    .stage-deploy { color: #f0c040; }
    .stage-article-removal { color: #E8613C; }
    .stage-whatsapp-send { color: #25D366; }
    .event-message { color: #ccc; }
    .event-summary {
      color: #555;
      font-size: 11px;
      padding: 0 12px 0 194px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .event-expand {
      display: none;
      padding: 8px 12px;
      margin: 0 8px 8px 8px;
      background: #111122;
      border-radius: 4px;
      font-size: 11px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
      color: #aaa;
      max-height: 400px;
      overflow-y: auto;
    }
    .event.selected .event-expand { display: block; }
    .event-expand .label { color: #666; }
    .event-expand .value { color: #ccc; }
    .event-expand .value.error { color: #E8613C; }
    .event-expand .value.success { color: #00C9A7; }
    .event-expand hr { border: none; border-top: 1px solid #222; margin: 6px 0; }
    .has-detail::after {
      content: ' ...';
      color: #444;
    }
    .empty-state {
      text-align: center;
      color: #444;
      padding: 60px 20px;
      font-size: 14px;
    }
    .empty-state .icon { font-size: 32px; margin-bottom: 12px; }
    .bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 20px;
      background: #1a1a2e;
      border-top: 1px solid #2a2a3e;
    }
    .bar-btn {
      background: #2a2a3e;
      color: #666;
      border: 1px solid #333;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .bar-btn:hover { border-color: #00C9A7; color: #00C9A7; }
    .bar-btn.danger:hover { border-color: #E8613C; color: #E8613C; }
    .bar-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .bar-btn:disabled:hover { border-color: #333; color: #666; }
    .pipeline-divider {
      border: none;
      border-top: 1px dashed #333;
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <h1>Pipeline Status</h1>
  <div class="subtitle">bashai.io article pipeline — live event stream</div>
  <div class="connection-status connecting" id="conn">connecting...</div>

  <div class="plans-container" id="plans"></div>

  <div class="tabs">
    <button class="tab-btn active" data-tab="pipeline">Pipeline</button>
    <button class="tab-btn" data-tab="tasks">Tasks Queue</button>
  </div>

  <div class="tab-panel active" id="panel-pipeline">
    <div class="events" id="events">
      <div class="empty-state" id="empty">
        <div class="icon">&#9678;</div>
        Waiting for pipeline events...<br>
        <span style="font-size:12px;color:#333">Send "Remove" via WhatsApp to trigger the pipeline</span>
      </div>
    </div>
  </div>

  <div class="tab-panel" id="panel-tasks">
    <div class="tasks-summary" id="tasksSummary"></div>
    <table class="tasks-table">
      <thead>
        <tr><th>Name</th><th>Status</th><th>Enabled</th><th>Type</th><th>Created</th></tr>
      </thead>
      <tbody id="tasksBody">
        <tr><td colspan="5" style="text-align:center;color:#444;padding:20px">Loading tasks...</td></tr>
      </tbody>
    </table>
  </div>
  <div class="bottom-bar">
    <button class="bar-btn danger" id="resetBtn" onclick="resetAll()">Reset All</button>
  </div>
  <div style="height:50px"></div>

  <script>
    const plansEl = document.getElementById('plans');
    const eventsEl = document.getElementById('events');
    const connEl = document.getElementById('conn');
    let allEvents = [];
    let lastPipelineId = null;
    let selectedId = null;
    let knownEventIds = new Set();

    // Determine base URL for API calls (must be before any fetch)
    const isLogDomain = location.hostname.startsWith('log.');
    const basePath = isLogDomain ? '/pipeline' : '/api/pipeline';

    // --- Plan state ---
    const plans = new Map();
    const elapsedTimers = new Map();

    const STEP_ICONS = {
      pending: '<span class="step-icon pending">&#9675;</span>',
      active: '<span class="step-icon active spinner">&#9686;</span>',
      done: '<span class="step-icon done">&#10003;</span>',
      failed: '<span class="step-icon failed">&#10007;</span>',
      skipped: '<span class="step-icon skipped">&#8212;</span>',
    };

    function formatElapsed(ms) {
      const s = Math.floor(ms / 1000);
      if (s < 60) return s + 's';
      const m = Math.floor(s / 60);
      return m + 'm ' + (s % 60) + 's';
    }

    function removeEmptyState() {
      const el = eventsEl.querySelector('.empty-state');
      if (el) el.remove();
    }

    function showEmptyState(msg) {
      eventsEl.innerHTML = '<div class="empty-state"><div class="icon">&#9678;</div>' + msg + '</div>';
    }

    function renderPlan(plan) {
      const done = plan.steps.filter(s => s.status === 'done').length;
      const failed = plan.steps.filter(s => s.status === 'failed').length;
      const total = plan.steps.length;
      const pct = Math.round(((done + failed) / total) * 100);
      const elapsed = Date.now() - plan.startedAt;

      let html = '<div class="plan-card ' + plan.status + '" id="plan-' + plan.pipelineId + '">';
      html += '<div class="plan-header">';
      html += '<span class="plan-title">' + escapeHtml(plan.title) + '</span>';
      html += '<span class="plan-badge ' + plan.status + '">' + plan.status + '</span>';
      html += '</div>';

      html += '<div class="plan-progress">';
      html += '<div class="plan-progress-bar"><div class="plan-progress-fill ' + plan.status + '" style="width:' + pct + '%"></div></div>';
      html += '<span class="plan-progress-text">' + done + '/' + total + '</span>';
      html += '</div>';

      html += '<div class="plan-elapsed" data-started="' + plan.startedAt + '">' + formatElapsed(elapsed) + ' elapsed</div>';

      html += '<div class="plan-steps">';
      let lastPhase = null;
      for (const step of plan.steps) {
        // Render phase header if phase changed
        if (step.phase && step.phase !== lastPhase) {
          lastPhase = step.phase;
          // Determine phase status: get all steps in this phase
          const phaseSteps = plan.steps.filter(s => s.phase === step.phase);
          const allDone = phaseSteps.every(s => s.status === 'done');
          const anyActive = phaseSteps.some(s => s.status === 'active');
          const anyFailed = phaseSteps.some(s => s.status === 'failed');
          const phaseCls = anyFailed ? 'phase-failed' : (allDone ? 'phase-done' : (anyActive ? 'phase-active' : ''));
          const phaseCheck = allDone ? ' &#10003;' : (anyFailed ? ' &#10007;' : '');
          html += '<div class="phase-header ' + phaseCls + '">' + escapeHtml(step.phase) + phaseCheck + '</div>';
        }

        const icon = STEP_ICONS[step.status] || STEP_ICONS.pending;
        const labelCls = 'step-label ' + step.status;

        // Build time display: always show estimate, then actual separately
        let timeHtml = '';
        const est = step.estimatedSeconds ? '~' + step.estimatedSeconds + 's' : '';

        if (step.status === 'done' && step.startedAt && step.completedAt) {
          const dur = Math.round((step.completedAt - step.startedAt) / 1000);
          const isSlow = step.estimatedSeconds && dur > step.estimatedSeconds * 2;
          const isFast = step.estimatedSeconds && dur < step.estimatedSeconds * 0.5;
          const actualCls = isSlow ? 'slow' : (isFast ? 'fast' : '');
          timeHtml = '<span class="step-time">' + dur + 's</span>';
          if (est) timeHtml += '<span class="step-est">(est ' + est + ')</span>';
        } else if (step.status === 'active' && step.startedAt) {
          const dur = Math.round((Date.now() - step.startedAt) / 1000);
          const isSlow = step.estimatedSeconds && dur > step.estimatedSeconds * 2;
          timeHtml = '<span class="step-time' + (isSlow ? ' slow' : '') + '">' + dur + 's...</span>';
          if (est) timeHtml += '<span class="step-est">(est ' + est + ')</span>';
        } else if (step.status === 'pending') {
          if (est) timeHtml = '<span class="step-est">est ' + est + '</span>';
        } else if (step.status === 'failed') {
          if (step.startedAt && step.completedAt) {
            const dur = Math.round((step.completedAt - step.startedAt) / 1000);
            timeHtml = '<span class="step-time slow">' + dur + 's</span>';
          }
          if (est) timeHtml += '<span class="step-est">(est ' + est + ')</span>';
        }

        html += '<div class="plan-step ' + step.status + '">';
        html += icon;
        html += '<span class="' + labelCls + '">' + escapeHtml(step.label) + '</span>';
        html += '<span class="step-times">' + timeHtml + '</span>';
        html += '</div>';
        if (step.detail) {
          html += '<div class="step-detail">' + escapeHtml(step.detail) + '</div>';
        }
      }
      html += '</div></div>';
      return html;
    }

    function updatePlan(plan) {
      plans.set(plan.pipelineId, plan);
      const existing = document.getElementById('plan-' + plan.pipelineId);
      const html = renderPlan(plan);
      if (existing) {
        existing.outerHTML = html;
      } else {
        plansEl.insertAdjacentHTML('afterbegin', html);
      }

      if (plan.status === 'running' && !elapsedTimers.has(plan.pipelineId)) {
        const timerId = setInterval(() => {
          const p = plans.get(plan.pipelineId);
          if (!p || p.status !== 'running') {
            clearInterval(timerId);
            elapsedTimers.delete(plan.pipelineId);
            return;
          }
          const card = document.getElementById('plan-' + plan.pipelineId);
          if (card) {
            const elapsedEl = card.querySelector('.plan-elapsed');
            if (elapsedEl) {
              elapsedEl.textContent = formatElapsed(Date.now() - p.startedAt) + ' elapsed';
            }
            card.querySelectorAll('.plan-step.active .step-time').forEach(el => {
              const step = p.steps.find(s => s.status === 'active');
              if (step && step.startedAt) {
                const dur = Math.round((Date.now() - step.startedAt) / 1000);
                const isSlow = step.estimatedSeconds && dur > step.estimatedSeconds * 2;
                el.className = 'step-time' + (isSlow ? ' slow' : '');
                el.textContent = dur + 's...';
              }
            });
          }
        }, 1000);
        elapsedTimers.set(plan.pipelineId, timerId);
      }

      if (plan.status !== 'running' && elapsedTimers.has(plan.pipelineId)) {
        clearInterval(elapsedTimers.get(plan.pipelineId));
        elapsedTimers.delete(plan.pipelineId);
        const card = document.getElementById('plan-' + plan.pipelineId);
        if (card) card.outerHTML = renderPlan(plan);
      }
    }

    function formatTime(ts) {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-AU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function stageClass(stage) {
      return 'stage-' + stage.replace(/[^a-z0-9]/g, '-');
    }

    function formatFullDetail(ev) {
      let parts = [];
      parts.push('<span class="label">ID:</span> <span class="value">' + ev.id + '</span>');
      parts.push('<span class="label">Time:</span> <span class="value">' + new Date(ev.timestamp).toISOString() + '</span>');
      parts.push('<span class="label">Stage:</span> <span class="value">' + escapeHtml(ev.stage) + '</span>');
      parts.push('<span class="label">Event:</span> <span class="value">' + escapeHtml(ev.event) + '</span>');
      if (ev.pipelineId) {
        parts.push('<span class="label">Pipeline:</span> <span class="value">' + escapeHtml(ev.pipelineId) + '</span>');
      }
      parts.push('<hr>');
      parts.push('<span class="label">Message:</span>');
      parts.push('<span class="value">' + escapeHtml(ev.message) + '</span>');
      if (ev.detail) {
        parts.push('<hr>');
        parts.push('<span class="label">Detail:</span>');
        parts.push('<span class="value">' + escapeHtml(ev.detail) + '</span>');
      }
      if (ev.fullDetail) {
        parts.push('<hr>');
        parts.push('<span class="label">Full Log:</span>');
        let formatted = ev.fullDetail;
        try {
          const parsed = JSON.parse(ev.fullDetail);
          formatted = JSON.stringify(parsed, null, 2);
        } catch {}
        const cls = ev.level === 'error' ? 'value error' : 'value';
        parts.push('<span class="' + cls + '">' + escapeHtml(formatted) + '</span>');
      }
      return parts.join('\\n');
    }

    function renderEvent(ev) {
      let html = '';
      if (ev.pipelineId && ev.pipelineId !== lastPipelineId) {
        if (lastPipelineId !== null) {
          html += '<hr class="pipeline-divider">';
        }
        lastPipelineId = ev.pipelineId;
      }
      const hasDetail = ev.detail || ev.fullDetail;
      html += '<div class="event ' + ev.level + '" data-stage="' + ev.stage + '" data-id="' + ev.id + '">';
      html += '<div class="event-row">';
      html += '<span class="event-time">' + formatTime(ev.timestamp) + '</span>';
      html += '<span class="event-stage ' + stageClass(ev.stage) + '">' + ev.stage + '</span>';
      html += '<span class="event-message' + (hasDetail ? ' has-detail' : '') + '">' + escapeHtml(ev.message) + '</span>';
      html += '</div>';
      if (ev.detail) {
        html += '<div class="event-summary">' + escapeHtml(ev.detail) + '</div>';
      }
      html += '<div class="event-expand">' + formatFullDetail(ev) + '</div>';
      html += '</div>';
      return html;
    }

    function escapeHtml(s) {
      if (!s) return '';
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function toggleEvent(id) {
      const prev = document.querySelector('.event.selected');
      if (prev && prev.dataset.id === id) {
        prev.classList.remove('selected');
        selectedId = null;
        return;
      }
      if (prev) prev.classList.remove('selected');
      const el = document.querySelector('.event[data-id="' + id + '"]');
      if (el) {
        el.classList.add('selected');
        selectedId = id;
      }
    }

    eventsEl.addEventListener('click', (e) => {
      const eventEl = e.target.closest('.event');
      if (eventEl && eventEl.dataset.id) {
        toggleEvent(eventEl.dataset.id);
      }
    });

    function addEvent(ev) {
      if (knownEventIds.has(ev.id)) return; // deduplicate
      knownEventIds.add(ev.id);
      allEvents.push(ev);
      removeEmptyState();
      eventsEl.insertAdjacentHTML('beforeend', renderEvent(ev));
      window.scrollTo(0, document.body.scrollHeight);
    }

    function clearUI() {
      allEvents = [];
      lastPipelineId = null;
      selectedId = null;
      knownEventIds.clear();
      plans.clear();
      elapsedTimers.forEach(t => clearInterval(t));
      elapsedTimers.clear();
      plansEl.innerHTML = '';
      showEmptyState('Ready. Waiting for pipeline events...<br><span style="font-size:12px;color:#333">Send "Remove" via WhatsApp to trigger the pipeline</span>');
    }

    async function resetAll() {
      const btn = document.getElementById('resetBtn');
      if (btn) { btn.disabled = true; btn.textContent = 'Resetting...'; }
      try {
        const r = await fetch(basePath + '/reset', { method: 'POST' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        clearUI();
        if (btn) { btn.textContent = 'Done!'; btn.style.borderColor = '#00C9A7'; btn.style.color = '#00C9A7'; }
        setTimeout(() => {
          if (btn) { btn.disabled = false; btn.textContent = 'Reset All'; btn.style.borderColor = ''; btn.style.color = ''; }
        }, 1500);
      } catch (e) {
        console.error('Reset failed:', e);
        if (btn) { btn.textContent = 'Failed!'; btn.style.borderColor = '#E8613C'; btn.style.color = '#E8613C'; }
        setTimeout(() => {
          if (btn) { btn.disabled = false; btn.textContent = 'Reset All'; btn.style.borderColor = ''; btn.style.color = ''; }
        }, 2000);
      }
    }

    // --- Tab switching ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
        if (btn.dataset.tab === 'tasks') loadTasks();
      });
    });

    // --- Tasks tab ---
    function formatAgo(ts) {
      if (!ts) return '—';
      const s = Math.round((Date.now() - ts) / 1000);
      if (s < 60) return s + 's ago';
      const m = Math.floor(s / 60);
      if (m < 60) return m + 'm ago';
      const h = Math.floor(m / 60);
      if (h < 24) return h + 'h ago';
      return Math.floor(h / 24) + 'd ago';
    }

    function loadTasks() {
      fetch(basePath + '/tasks')
        .then(r => r.json())
        .then(tasks => {
          const body = document.getElementById('tasksBody');
          const summary = document.getElementById('tasksSummary');
          const running = tasks.filter(t => t.status === 'running').length;
          const enabled = tasks.filter(t => t.enabled).length;
          const total = tasks.length;

          let sumHtml = '<span class="stat">Total: <strong>' + total + '</strong></span>';
          sumHtml += '<span class="stat' + (enabled > 0 ? '' : '') + '">Enabled: <strong>' + enabled + '</strong></span>';
          sumHtml += '<span class="stat' + (running > 0 ? ' danger' : '') + '">Running: <strong>' + running + '</strong></span>';
          if (running > 0) sumHtml += '<span class="stat danger" style="color:#E8613C">&#9888; Running tasks may block the queue</span>';
          sumHtml += '<button class="tasks-refresh" onclick="loadTasks()">Refresh</button>';
          summary.innerHTML = sumHtml;

          if (tasks.length === 0) {
            body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#444;padding:20px">No tasks</td></tr>';
            return;
          }

          body.innerHTML = tasks.map(t => {
            return '<tr>'
              + '<td style="color:#ccc">' + escapeHtml(t.name || '—') + '</td>'
              + '<td><span class="task-status ' + (t.status || '') + '">' + (t.status || '—') + '</span></td>'
              + '<td><span class="' + (t.enabled ? 'task-enabled' : 'task-disabled') + '">' + (t.enabled ? 'Yes' : 'No') + '</span></td>'
              + '<td>' + (t.scheduleType || '—') + '</td>'
              + '<td>' + formatAgo(t.created) + '</td>'
              + '</tr>';
          }).join('');
        })
        .catch(err => {
          document.getElementById('tasksBody').innerHTML = '<tr><td colspan="5" style="color:#E8613C;padding:20px">Error loading tasks: ' + escapeHtml(err.message) + '</td></tr>';
        });
    }

    // Load server state (plans + history). Called on initial load and on SSE reconnect.
    function loadServerState() {
      return Promise.all([
        fetch(basePath + '/plans').then(r => r.json()).catch(() => ({ active: [], recent: [] })),
        fetch(basePath + '/events/history').then(r => r.json()).catch(() => []),
      ]).then(([planData, history]) => {
        // Merge plans (update existing, add new)
        for (const plan of [...(planData.recent || []), ...(planData.active || [])]) {
          updatePlan(plan);
        }
        // Add any events we haven't seen yet
        let added = 0;
        for (const ev of history) {
          if (!knownEventIds.has(ev.id)) {
            knownEventIds.add(ev.id);
            allEvents.push(ev);
            eventsEl.insertAdjacentHTML('beforeend', renderEvent(ev));
            added++;
          }
        }
        if (added > 0) {
          removeEmptyState();
          window.scrollTo(0, document.body.scrollHeight);
        }
      });
    }

    let currentES = null;

    function connect() {
      connEl.textContent = 'connecting...';
      connEl.className = 'connection-status connecting';

      if (currentES) { currentES.close(); currentES = null; }
      const es = new EventSource(basePath + '/events');
      currentES = es;

      es.onopen = () => {
        connEl.textContent = 'connected';
        connEl.className = 'connection-status connected';
        // Re-fetch server state on every reconnect to catch missed events
        loadServerState();
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'reset') {
            clearUI();
            return;
          }
          if (data.type === 'plan-update') {
            updatePlan(data.plan);
          } else if (data.id) {
            addEvent(data);
          }
        } catch {}
      };

      es.onerror = () => {
        connEl.textContent = 'disconnected \\u2014 reconnecting...';
        connEl.className = 'connection-status disconnected';
        es.close();
        currentES = null;
        setTimeout(connect, 3000);
      };
    }

    // Initial load
    loadServerState().then(() => connect()).catch(() => connect());
  </script>
</body>
</html>`;
}
