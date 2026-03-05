/**
 * Generic Scheduled Task Executor
 *
 * Periodically checks for due scheduled tasks and executes them.
 * Follows the same pattern as moltbook-scheduler.ts and email-scheduler.ts.
 *
 * Check interval: every 1 minute (tasks can be scheduled per-minute)
 * Uses enqueueHeartbeat() for per-user sequential execution.
 */

import { convex } from './convex-client.js';
import { executeWithClaudeCli } from './jobs/claude-cli.js';
import { enqueueHeartbeat } from './heartbeat-queue.js';
import { existsSync, mkdirSync } from 'fs';
import cronParser from 'cron-parser';
import { emitPipelineEvent, startPipeline, completePipelineStep, activatePipelineStep, failPipeline, generatePipelineId, findActivePipeline } from './pipeline-events.js';

const CHECK_INTERVAL_MS = 60 * 1000; // Check every 1 minute
const INITIAL_DELAY_MS = 3 * 60 * 1000; // 3 minutes after server start

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

/**
 * Start the task scheduler.
 * Called once during server startup.
 */
export function startTaskScheduler(): void {
  if (schedulerInterval) {
    console.warn('[TaskScheduler] Already running');
    return;
  }

  console.log('[TaskScheduler] Starting (checking every 1 minute)');

  // First check after a short delay
  setTimeout(async () => {
    await recoverStuckTasks();
    checkAndRunDueTasks().catch(err => {
      console.error('[TaskScheduler] Initial check failed:', err);
    });
  }, INITIAL_DELAY_MS);

  // Regular checks
  schedulerInterval = setInterval(() => {
    checkAndRunDueTasks().catch(err => {
      console.error('[TaskScheduler] Check failed:', err);
    });
  }, CHECK_INTERVAL_MS);
}

/**
 * Stop the scheduler (for graceful shutdown).
 */
export function stopTaskScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[TaskScheduler] Stopped');
  }
}

const STUCK_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

async function recoverStuckTasks(): Promise<void> {
  try {
    const stuckTasks = await convex.query('scheduledTasks:getStuckTasks' as any, {
      stuckThresholdMs: STUCK_THRESHOLD_MS,
    });

    if (!stuckTasks || stuckTasks.length === 0) return;

    console.log(`[TaskScheduler] Found ${stuckTasks.length} stuck task(s) — recovering`);
    emitPipelineEvent('task-scheduler', 'stuck-recovery', `Recovering ${stuckTasks.length} stuck task(s): ${stuckTasks.map((t: any) => t.name).join(', ')}`, { level: 'warn' });

    for (const task of stuckTasks) {
      try {
        await convex.mutation('scheduledTasks:resetStuckTask' as any, {
          taskId: task._id,
        });
        console.log(`[TaskScheduler] Reset stuck task: ${task.name}`);
      } catch (err: any) {
        console.error(`[TaskScheduler] Failed to reset stuck task "${task.name}":`, err.message);
      }
    }
  } catch (err: any) {
    console.error('[TaskScheduler] Stuck task recovery failed:', err.message);
  }
}

/**
 * Check for due tasks and execute them.
 */
async function checkAndRunDueTasks(): Promise<void> {
  if (isRunning) {
    return; // Skip if previous check is still running
  }

  isRunning = true;
  try {
    // Recover any stuck tasks first
    await recoverStuckTasks();

    const now = Date.now();
    const dueTasks = await convex.query('scheduledTasks:getDueTasks' as any, { now });

    if (!dueTasks || dueTasks.length === 0) {
      return;
    }

    console.log(`[TaskScheduler] Found ${dueTasks.length} due task(s)`);
    emitPipelineEvent('task-scheduler', 'due-tasks-found', `Found ${dueTasks.length} due task(s): ${dueTasks.map((t: any) => t.name).join(', ')}`);

    for (const task of dueTasks) {
      try {
        await enqueueHeartbeat(task.userId, `scheduled-task:${task.name}`, () =>
          executeScheduledTask(task)
        );
      } catch (err: any) {
        emitPipelineEvent('task-scheduler', 'enqueue-error', `Failed to enqueue "${task.name}": ${err.message}`, { level: 'error' });
        console.error(`[TaskScheduler] Failed to enqueue task "${task.name}":`, err);
      }
    }
  } finally {
    isRunning = false;
  }
}

/**
 * Execute a single scheduled task.
 */
async function executeScheduledTask(task: any): Promise<void> {
  const startTime = Date.now();
  console.log(`[TaskScheduler] Executing task "${task.name}" (${task.actionType})`);
  emitPipelineEvent('task-scheduler', 'task-starting', `Executing "${task.name}" (${task.actionType})`);

  // Mark task as running
  await convex.mutation('scheduledTasks:markTaskRunning' as any, { taskId: task._id });

  // Create a run record
  const runId = await convex.mutation('scheduledTasks:createRun' as any, {
    taskId: task._id,
    userId: task.userId,
  });

  try {
    const config = task.actionConfig || {};
    let result: any;

    switch (task.actionType) {
      case 'chat_prompt': {
        // Execute a prompt with Claude CLI
        const projectPath = config.projectPath || `/storage/users/${task.userId}/projects/automations`;
        if (!existsSync(projectPath)) {
          mkdirSync(projectPath, { recursive: true });
        }

        // Determine pipeline plan type based on task name
        // Try to attach to existing master pipeline first
        let planType: string | null = null;
        let masterType: string | null = null; // which master pipeline to look for
        if (task.name === 'Send article removal email') { planType = 'removal-email'; masterType = 'full-removal'; }
        else if (task.name?.startsWith('WhatsApp Idea:')) { planType = 'adhoc-article'; masterType = 'adhoc-article'; }
        else if (task.name === 'Daily AI/Tech Article Research') { planType = 'daily-article'; masterType = null; }
        // Note: 'batch-publish' and 'execute-removal' no longer run as Claude CLI tasks.
        // Publish uses publishApprovedArticles() (code-publish pipeline).
        // Removal uses removeArticle() (code-removal pipeline).

        const masterPlan = masterType ? findActivePipeline(masterType) : null;
        const plId = masterPlan ? masterPlan.pipelineId : generatePipelineId();
        const plan = masterPlan || (planType ? startPipeline(plId, planType) : null);

        // Determine step prefix based on plan type for namespaced step IDs
        const stepPrefixMap: Record<string, string> = {
          'removal-email': 'email-',
          'adhoc-article': 'idea-',
          'daily-article': 'da-',
        };
        const stepPrefix = (planType && stepPrefixMap[planType]) || '';

        if (plan) {
          activatePipelineStep(plId, stepPrefix + 'task-start');
          completePipelineStep(plId, stepPrefix + 'task-start');
          activatePipelineStep(plId, stepPrefix + 'spawn-cli');
        }

        emitPipelineEvent('claude-cli', 'spawning', `Spawning Claude CLI for "${task.name}" (model: ${config.model || 'sonnet'}, maxTurns: ${config.maxTurns || 15})`, { pipelineId: plId });

        let toolUseCount = 0;
        // Track which plan steps have been ticked off
        const completedSteps = new Set<string>();

        result = await executeWithClaudeCli({
          prompt: config.prompt || 'No prompt specified',
          userId: task.userId,
          projectId: config.projectId || 'automations',
          serviceContext: 'chat',
          workingDirectory: projectPath,
          skillMode: config.skillMode || 'project',
          projectPath,
          model: config.model || 'sonnet',
          maxTurns: config.maxTurns || 15,
          timeout: config.timeout || 10 * 60 * 1000, // 10 min default
          onToolUse: (toolName, toolInput) => {
            toolUseCount++;
            const inputSummary = summarizeToolInput(toolName, toolInput);
            // Capture full tool input as JSON for expandable detail
            let fullJson = '';
            try { fullJson = JSON.stringify(toolInput, null, 2); } catch {}
            emitPipelineEvent('claude-cli', 'tool-use', `[${task.name}] ${toolName}`, {
              detail: inputSummary,
              fullDetail: fullJson.slice(0, 5000),
              pipelineId: plId,
            });

            // Map tool-use events to pipeline plan steps
            if (plan) {
              const inputStr = typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput || {});
              const tick = (stepId: string) => {
                if (!completedSteps.has(stepId)) {
                  completedSteps.add(stepId);
                  completePipelineStep(plId, stepId);
                  // completePipelineStep auto-activates next step within same phase
                }
              };

              // Mark spawn-cli done on first tool use
              if (toolUseCount === 1 && !completedSteps.has(stepPrefix + 'spawn-cli')) {
                tick(stepPrefix + 'spawn-cli');
              }

              if (planType === 'removal-email') {
                // Email HTML is pre-built server-side — agent only does OAuth + send
                if (toolName === 'mcp__memory__automation' || toolName === 'automation') {
                  if (inputStr.includes('oauth2') || inputStr.includes('token') || inputStr.includes('login.microsoftonline.com')) tick('email-oauth-token');
                  if (inputStr.includes('store_credential') && inputStr.includes('MS_ACCESS_TOKEN')) tick('email-store-creds');
                  if (inputStr.includes('sendMail') || inputStr.includes('graph.microsoft.com')) tick('email-send-email');
                  if (inputStr.includes('whatsapp/send')) tick('email-whatsapp-confirm');
                }
              } else if (planType === 'adhoc-article' || planType === 'daily-article') {
                // Map tool calls to article generation steps (creative phase only)
                // Post-processing steps (save-batch, send-email, whatsapp-notify) are
                // tracked by the post-processing code below, not by tool-use mapping
                const p = planType === 'adhoc-article' ? 'idea-' : 'da-';
                if (toolName === 'Read' && inputStr.includes('article-sources')) tick(p + 'read-sources');
                if (toolName === 'WebSearch' || toolName === 'WebFetch' || (toolName === 'Bash' && (inputStr.includes('curl') || inputStr.includes('search')))) {
                  if (p === 'da-') tick('da-read-sources'); // daily must have read sources by now
                  tick(p === 'da-' ? 'da-web-research' : 'idea-research');
                }
                // Claude outputs JSON — if it writes anything, the article is done
                if (toolName === 'Write' || (toolName === 'mcp__memory__automation' && inputStr.includes('write_file'))) {
                  tick(p === 'da-' ? 'da-write-articles' : 'idea-write');
                }
              }
              // Note: batch-publish and execute-removal no longer run as Claude CLI tasks.
              // Publish is handled by publishApprovedArticles() → code-publish pipeline.
              // Removal is handled by removeArticle() → code-removal pipeline.
            }
          },
        });

        // Mark task-complete step (with namespace prefix)
        if (plan) {
          if (result?.success) {
            completePipelineStep(plId, stepPrefix + 'task-complete');
          } else {
            completePipelineStep(plId, stepPrefix + 'task-complete', 'failed', result?.error?.slice(0, 200));
            // Only fail the whole pipeline if this is the last phase (execute-removal)
            // For intermediate phases (removal-email), don't kill the master pipeline
            if (planType === 'execute-removal' || !masterPlan) {
              failPipeline(plId, result?.error || 'Task failed');
            }
          }
        }

        emitPipelineEvent('claude-cli', 'completed', `Claude CLI finished for "${task.name}" — ${toolUseCount} tool calls, ${result?.success ? 'success' : 'FAILED'}`, {
          level: result?.success ? 'success' : 'error',
          detail: result?.error || (result?.content?.slice(0, 300)),
          pipelineId: plId,
          fullDetail: JSON.stringify({
            success: result?.success,
            error: result?.error,
            cost: result?.cost,
            usage: result?.usage,
            output: result?.content?.slice(0, 3000),
          }, null, 2),
        });

        // Post-processing for article pipeline tasks
        if (config.postProcess === 'article-idea' && result?.success && result?.content) {
          try {
            const { saveBatchFile, sendApprovalEmail, sendWhatsAppMessage } = await import('./article-pipeline.js');
            emitPipelineEvent('claude-cli', 'post-process', `Running article-idea post-processing`, { pipelineId: plId });

            // Parse Claude's JSON output
            let articleJson: any;
            const content = result.content || result.fullContent || '';
            // Try to extract JSON from the output (may be wrapped in markdown fences)
            const jsonMatch = content.match(/\{[\s\S]*"slug"[\s\S]*"body"[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error('Claude did not return valid article JSON');
            }
            articleJson = JSON.parse(jsonMatch[0]);

            // Build batch data
            const meta = config.postProcessMeta || {};
            const batchToken = meta.batchToken || Math.random().toString(36).slice(2, 10);
            const dateStr = meta.date || new Date().toISOString().split('T')[0];
            const batch = {
              batchToken,
              date: dateStr,
              source: meta.source || 'whatsapp-idea',
              articles: [{
                id: 'art_1',
                status: 'pending',
                slug: articleJson.slug,
                tag: articleJson.tag,
                title: articleJson.title,
                excerpt: articleJson.excerpt,
                readTime: articleJson.readTime,
                body: articleJson.body,
              }],
            };

            // Save batch file — track on dashboard
            activatePipelineStep(plId, 'idea-save-batch');
            const batchPath = saveBatchFile(batch);
            completePipelineStep(plId, 'idea-save-batch', 'done', batchPath);

            // Send approval email
            activatePipelineStep(plId, 'idea-send-email');
            await sendApprovalEmail(batch, meta.ideaText ? `WhatsApp idea: "${meta.ideaText}"` : undefined);
            completePipelineStep(plId, 'idea-send-email');

            // WhatsApp notification
            activatePipelineStep(plId, 'idea-whatsapp-notify');
            await sendWhatsAppMessage('Article draft ready — check your email to approve or reject');
            completePipelineStep(plId, 'idea-whatsapp-notify');
            emitPipelineEvent('claude-cli', 'post-process', `Post-processing complete`, { level: 'success', pipelineId: plId });
          } catch (postErr: any) {
            console.error(`[TaskScheduler] Article post-processing failed:`, postErr.message);
            emitPipelineEvent('claude-cli', 'post-process-error', `Post-processing failed: ${postErr.message}`, { level: 'error', pipelineId: plId });
            failPipeline(plId, `Post-processing failed: ${postErr.message.slice(0, 200)}`);
            // Send failure notification
            try {
              const { sendWhatsAppMessage: notify } = await import('./article-pipeline.js');
              await notify(`ARTICLE IDEA FAILED (post-processing): ${postErr.message.slice(0, 200)}`);
            } catch { /* best effort */ }
          }
        }

        // Post-processing for daily article research
        if (config.postProcess === 'daily-articles' && result?.success && result?.content) {
          try {
            const { saveBatchFile, sendApprovalEmail, sendWhatsAppMessage } = await import('./article-pipeline.js');
            emitPipelineEvent('claude-cli', 'post-process', `Running daily-articles post-processing`, { pipelineId: plId });

            // Parse Claude's JSON array output
            const content = result.content || result.fullContent || '';
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
              throw new Error('Claude did not return valid articles JSON array');
            }
            const articlesArray = JSON.parse(jsonMatch[0]);

            const batchToken = Math.random().toString(36).slice(2, 10);
            const dateStr = new Date().toISOString().split('T')[0];
            const batch = {
              batchToken,
              date: dateStr,
              source: 'daily-research',
              articles: articlesArray.map((a: any, i: number) => ({
                id: `art_${i + 1}`,
                status: 'pending',
                slug: a.slug,
                tag: a.tag,
                title: a.title,
                excerpt: a.excerpt,
                readTime: a.readTime,
                body: a.body,
              })),
            };

            // Save batch file — track on dashboard
            activatePipelineStep(plId, 'da-save-batch');
            const batchPath = saveBatchFile(batch);
            completePipelineStep(plId, 'da-save-batch', 'done', `${batch.articles.length} articles → ${batchPath}`);

            // Send approval email
            activatePipelineStep(plId, 'da-send-email');
            await sendApprovalEmail(batch, 'Daily AI/Tech Research');
            completePipelineStep(plId, 'da-send-email');

            // WhatsApp notification
            activatePipelineStep(plId, 'da-whatsapp-notify');
            await sendWhatsAppMessage(`Your daily articles are ready! Check your email for Publish/Reject buttons.`);
            completePipelineStep(plId, 'da-whatsapp-notify');
            emitPipelineEvent('claude-cli', 'post-process', `Post-processing complete`, { level: 'success', pipelineId: plId });
          } catch (postErr: any) {
            console.error(`[TaskScheduler] Daily articles post-processing failed:`, postErr.message);
            emitPipelineEvent('claude-cli', 'post-process-error', `Post-processing failed: ${postErr.message}`, { level: 'error', pipelineId: plId });
            failPipeline(plId, `Post-processing failed: ${postErr.message.slice(0, 200)}`);
            try {
              const { sendWhatsAppMessage: notify } = await import('./article-pipeline.js');
              await notify(`Daily articles post-processing failed: ${postErr.message.slice(0, 200)}`);
            } catch { /* best effort */ }
          }
        }

        break;
      }

      case 'workflow': {
        // Load and execute a workflow as a prompt
        const { readWorkflow: loadWorkflow } = await import('./config.js');
        const workflowContent = await loadWorkflow(
          task.userId,
          config.workflowCategory || 'general',
          config.workflowName
        );

        const projectPath = config.projectPath || `/storage/users/${task.userId}/projects/automations`;
        if (!existsSync(projectPath)) {
          mkdirSync(projectPath, { recursive: true });
        }

        result = await executeWithClaudeCli({
          prompt: `Execute this workflow:\n\n${workflowContent}`,
          userId: task.userId,
          projectId: config.projectId || 'automations',
          serviceContext: 'chat',
          workingDirectory: projectPath,
          skillMode: config.skillMode || 'all',
          projectPath,
          model: config.model || 'sonnet',
          maxTurns: config.maxTurns || 30,
          timeout: config.timeout || 20 * 60 * 1000, // 20 min for workflows
        });
        break;
      }

      case 'skill': {
        // Load a skill and execute it as a prompt
        const { readSkill: loadSkill } = await import('./skills.js');
        const skillContent = await loadSkill(config.skillName, undefined, task.userId);

        const projectPath = config.projectPath || `/storage/users/${task.userId}/projects/automations`;
        if (!existsSync(projectPath)) {
          mkdirSync(projectPath, { recursive: true });
        }

        result = await executeWithClaudeCli({
          prompt: config.prompt
            ? `Using the skill "${config.skillName}":\n\n${skillContent}\n\n${config.prompt}`
            : `Execute the following skill:\n\n${skillContent}`,
          userId: task.userId,
          projectId: config.projectId || 'automations',
          serviceContext: 'chat',
          workingDirectory: projectPath,
          skillMode: 'all',
          projectPath,
          model: config.model || 'sonnet',
          maxTurns: config.maxTurns || 20,
          timeout: config.timeout || 15 * 60 * 1000,
        });
        break;
      }

      case 'http_request': {
        // Execute an HTTP request with credential template resolution
        const {
          resolveCredentialTemplates,
          resolveCredentialTemplatesInRecord,
        } = await import('./credential-resolver.js');

        const url = config.url;
        if (!url) {
          throw new Error('http_request action requires url in actionConfig');
        }

        const httpMethod = config.method || 'GET';
        const httpTimeout = config.timeout || 30000;

        // Resolve credential templates
        const resolvedUrl = await resolveCredentialTemplates(url, task.userId);
        const resolvedHeaders = config.headers
          ? await resolveCredentialTemplatesInRecord(config.headers, task.userId)
          : {};
        const resolvedBody = config.body
          ? await resolveCredentialTemplates(config.body, task.userId)
          : undefined;

        // Execute request with timeout
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), httpTimeout);

        try {
          const response = await fetch(resolvedUrl, {
            method: httpMethod,
            headers: resolvedHeaders,
            body: resolvedBody,
            signal: controller.signal,
          });

          clearTimeout(timer);

          const status = response.status;
          const responseText = await response.text();
          const expectedStatus = config.expectedStatus;
          const success = expectedStatus
            ? status === expectedStatus
            : status >= 200 && status < 300;

          result = {
            success,
            output: `${httpMethod} ${config.url} → ${status}\n${responseText.slice(0, 5000)}`,
          };
        } catch (fetchErr: any) {
          clearTimeout(timer);
          if (fetchErr.name === 'AbortError') {
            throw new Error(`HTTP request to ${config.url} timed out after ${httpTimeout}ms`);
          }
          throw fetchErr;
        }
        break;
      }

      case 'agent_team': {
        // Launch an agent team via the delegate tool
        const { handleDelegateCommand } = await import('./delegate-tool.js');

        if (!config.goal || !config.agents || config.agents.length === 0) {
          throw new Error('agent_team action requires goal and agents in actionConfig');
        }

        const teamDir = config.directory || `/storage/users/${task.userId}/projects/automations`;
        const { mkdirSync, existsSync } = await import('fs');
        if (!existsSync(teamDir)) {
          mkdirSync(teamDir, { recursive: true });
        }

        const delegateResult = await handleDelegateCommand({
          command: 'create_team',
          user_id: task.userId,
          goal: config.goal,
          plan: config.plan || '',
          agents: config.agents,
          directory: teamDir,
          team_mode: config.team_mode || 'lead',
          budget_limit: config.budget_limit,
          team_name: config.team_name || `Scheduled: ${task.name}`,
          project_id: config.projectId,
        });

        result = {
          success: !delegateResult.isError,
          output: delegateResult.content[0]?.text || 'Team created',
        };
        break;
      }

      case 'container_start': {
        const containerId = config.containerId;
        if (!containerId) throw new Error('container_start action requires containerId in actionConfig');
        const startResp = await fetch(`http://localhost:${process.env.PORT || 3100}/api/preview/containers/${encodeURIComponent(containerId)}/start`, { method: 'POST' });
        if (!startResp.ok) throw new Error(`Container start failed: ${startResp.status} ${await startResp.text()}`);
        result = { success: true, output: `Container ${config.containerName || containerId} started` };
        break;
      }

      case 'container_stop': {
        const containerId = config.containerId;
        if (!containerId) throw new Error('container_stop action requires containerId in actionConfig');
        const stopResp = await fetch(`http://localhost:${process.env.PORT || 3100}/api/preview/containers/${encodeURIComponent(containerId)}/stop`, { method: 'POST' });
        if (!stopResp.ok) throw new Error(`Container stop failed: ${stopResp.status} ${await stopResp.text()}`);
        result = { success: true, output: `Container ${config.containerName || containerId} stopped` };
        break;
      }

      default:
        throw new Error(`Unknown action type: ${task.actionType}`);
    }

    const duration = Date.now() - startTime;
    const success = result?.success ?? false;

    // Complete the run record
    await convex.mutation('scheduledTasks:completeRun' as any, {
      runId,
      status: success ? 'success' : 'failed',
      result: result?.output?.slice(0, 5000) || '',
      error: result?.error?.slice(0, 2000) || undefined,
      cost: result?.cost,
    });

    // Compute next run time
    const nextRunAt = computeNextRunAt(task);

    // Complete the task record
    await convex.mutation('scheduledTasks:completeTaskRun' as any, {
      taskId: task._id,
      success,
      nextRunAt,
      disableAfterRun: task.scheduleType === 'one-time',
    });

    const durationSec = Math.round(duration / 1000);
    const costStr = result?.cost ? ` ($${result.cost.toFixed(4)})` : '';
    console.log(`[TaskScheduler] Task "${task.name}" ${success ? 'succeeded' : 'failed'} in ${durationSec}s${costStr}`);
    emitPipelineEvent('task-scheduler', success ? 'task-succeeded' : 'task-failed',
      `"${task.name}" ${success ? 'succeeded' : 'FAILED'} in ${durationSec}s${costStr}`,
      {
        level: success ? 'success' : 'error',
        detail: result?.error || result?.output?.slice(0, 300),
        fullDetail: JSON.stringify({
          taskName: task.name,
          actionType: task.actionType,
          success,
          durationSeconds: durationSec,
          cost: result?.cost,
          error: result?.error,
          output: result?.output?.slice(0, 5000) || result?.content?.slice(0, 5000),
        }, null, 2),
      }
    );

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[TaskScheduler] Task "${task.name}" error:`, err);
    emitPipelineEvent('task-scheduler', 'task-error', `"${task.name}" threw an error: ${errMsg.slice(0, 200)}`, {
      level: 'error',
      fullDetail: JSON.stringify({ taskName: task.name, error: errMsg, stack: err instanceof Error ? err.stack : undefined }, null, 2),
    });

    // Complete run with error
    await convex.mutation('scheduledTasks:completeRun' as any, {
      runId,
      status: 'failed',
      error: errMsg.slice(0, 2000),
    }).catch(() => {});

    // Compute next run and complete
    const nextRunAt = computeNextRunAt(task);
    await convex.mutation('scheduledTasks:completeTaskRun' as any, {
      taskId: task._id,
      success: false,
      nextRunAt,
      error: errMsg.slice(0, 500),
      disableAfterRun: task.scheduleType === 'one-time',
    }).catch(() => {});
  }
}

/**
 * Summarize tool input for pipeline events (keep it concise).
 */
function summarizeToolInput(toolName: string, input: Record<string, unknown>): string {
  try {
    // For automation/http tools, show the command and key fields
    if (toolName.includes('automation') || toolName.includes('memory')) {
      const cmd = input.command || '';
      if (cmd === 'http_request') {
        return `${input.http_method || 'GET'} ${input.http_url || ''}`.slice(0, 200);
      }
      if (cmd === 'store_credential') {
        return `store_credential: ${input.credential_name}`;
      }
      return `${cmd}${input.credential_name ? ': ' + input.credential_name : ''}`;
    }
    // For Bash, show the command
    if (toolName === 'Bash' || toolName === 'bash') {
      return String(input.command || '').slice(0, 200);
    }
    // For Read/Write/Edit, show the file path
    if (input.file_path) {
      return String(input.file_path);
    }
    if (input.path) {
      return String(input.path);
    }
    // Default: first 150 chars of JSON
    return JSON.stringify(input).slice(0, 150);
  } catch {
    return '';
  }
}

/**
 * Compute the next run time for a task.
 */
function computeNextRunAt(task: any): number | undefined {
  const now = Date.now();
  let nextRun: number | undefined;

  switch (task.scheduleType) {
    case 'interval':
      nextRun = task.intervalMinutes ? now + task.intervalMinutes * 60 * 1000 : undefined;
      break;

    case 'cron':
      nextRun = computeNextCronRun(task.cronExpression, now, task.timezone);
      break;

    case 'one-time':
      return undefined; // One-time tasks don't recur

    default:
      return undefined;
  }

  if (!nextRun) return undefined;

  // Apply time-window constraints if configured
  if (task.activeHoursStart !== undefined || task.activeDays) {
    nextRun = applyActiveWindow(nextRun, task);
  }

  return nextRun;
}

/**
 * Compute next cron run using cron-parser library.
 * Handles all standard 5-field cron expressions: * /5, ranges, named days, etc.
 * Timezone-aware via the tz option.
 */
function computeNextCronRun(expression: string | undefined, now: number, timezone?: string): number | undefined {
  if (!expression) return undefined;

  try {
    const options: any = { currentDate: new Date(now) };
    if (timezone) options.tz = timezone;
    const interval = cronParser.parseExpression(expression, options);
    return interval.next().getTime();
  } catch {
    console.warn(`[TaskScheduler] Invalid cron expression: "${expression}", fallback 24h`);
    return now + 24 * 60 * 60 * 1000;
  }
}

/**
 * Apply active-window constraints to a candidate run time.
 * Advances the timestamp to the next valid slot if it falls outside the window.
 */
function applyActiveWindow(timestamp: number, task: any): number {
  const tz = task.timezone || 'UTC';
  let candidate = new Date(timestamp);

  // Loop up to 8 days of hourly checks to find next valid slot
  for (let i = 0; i < 8 * 24; i++) {
    const localHour = getHourInTimezone(candidate, tz);
    const localDay = getDayInTimezone(candidate, tz);

    const dayOk = !task.activeDays || task.activeDays.includes(localDay);
    const hourOk = task.activeHoursStart === undefined ||
      (localHour >= task.activeHoursStart && localHour < (task.activeHoursEnd ?? 24));

    if (dayOk && hourOk) return candidate.getTime();

    // Advance by 1 hour
    candidate = new Date(candidate.getTime() + 60 * 60 * 1000);
  }

  return timestamp; // fallback: run anyway
}

/**
 * Get the hour (0-23) of a date in a specific timezone.
 */
function getHourInTimezone(date: Date, tz: string): number {
  return parseInt(new Intl.DateTimeFormat('en', { hour: 'numeric', hour12: false, timeZone: tz }).format(date));
}

/**
 * Get the day of week (0=Sun, 1=Mon...6=Sat) of a date in a specific timezone.
 */
function getDayInTimezone(date: Date, tz: string): number {
  const dayName = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: tz }).format(date);
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return dayMap[dayName] ?? 0;
}
