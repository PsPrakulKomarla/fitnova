import React, { useState } from 'react';
import {
  Workflow,
  Zap,
  Play,
  CheckCircle2,
  Mail,
  Clock,
  ArrowRight,
  Code2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BellRing,
  Send
} from 'lucide-react';
import { NotificationLog, WorkflowExecutionLog } from '../types/index.js';

interface WorkflowAutomationProps {
  workflowLogs: WorkflowExecutionLog[];
  notifications: NotificationLog[];
  onTriggerWorkflow: (workflowId: 'food_event' | 'daily_review' | 'weekly_adaptation') => Promise<void>;
}

export const WorkflowAutomationView: React.FC<WorkflowAutomationProps> = ({
  workflowLogs,
  notifications,
  onTriggerWorkflow
}) => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'workflows' | 'brevo'>('workflows');
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const workflows = [
    {
      id: 'food_event' as const,
      name: 'Workflow 01: Food Event Ingestion Webhook',
      trigger: 'POST /api/workflows/food-event (Webhook)',
      schedule: 'Event-driven (On Food Analyzed / Logged)',
      desc: 'Receives analyzed meal payload, fetches user macro targets, executes deterministic gap detection, and triggers Brevo smart nudges if gap > 30g.',
      nodes: [
        'Webhook Inbound Trigger',
        'Verify Signature / Auth',
        'Fetch User Current Day State',
        'Deterministic Macro Gap Math',
        'Postgres Telemetry Commit',
        'Brevo Smart Nudge Rule Check'
      ]
    },
    {
      id: 'daily_review' as const,
      name: 'Workflow 02: Daily 21:00 Evening Review Cron',
      trigger: 'Cron: 0 21 * * *',
      schedule: 'Every evening at 21:00 local time',
      desc: 'Aggregates full-day caloric and macronutrient logs, calculates daily adherence percentage, and dispatches daily summary digest.',
      nodes: [
        'Cron Schedule Trigger (21:00)',
        'Aggregate Daily Macros & Logs',
        'Compute Daily Adherence %',
        'Brevo API: Dispatch Summary'
      ]
    },
    {
      id: 'weekly_adaptation' as const,
      name: 'Workflow 03: Sunday 19:00 Weekly Review & Recalibration',
      trigger: 'Cron: 0 19 * * SUN',
      schedule: 'Weekly on Sunday at 19:00',
      desc: 'Audits 7-day adherence vs plan expectations. Identifies schedule friction points, generates structured plan adaptation proposal, and prompts human-in-the-loop review.',
      nodes: [
        'Cron Sunday 19:00 Trigger',
        'Fetch 7-Day Food & Workout Logs',
        'Statistical Deviation Detector',
        'Agent Recalibration Proposal',
        'Human-In-The-Loop Approval Gate',
        'Brevo Proposal Notification'
      ]
    }
  ];

  const handleTrigger = async (id: 'food_event' | 'daily_review' | 'weekly_adaptation') => {
    setTriggeringId(id);
    try {
      await onTriggerWorkflow(id);
    } finally {
      setTriggeringId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Workflow Orchestration & Communication Layer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              n8n Pipelines & Brevo Notifications
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Backend database is authoritative. n8n orchestrates long-running webhooks, cron intervals, and human-in-the-loop triggers, while Brevo handles personalized message delivery.
            </p>
          </div>

          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveWorkflowTab('workflows')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeWorkflowTab === 'workflows'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              n8n Pipelines ({workflows.length})
            </button>
            <button
              onClick={() => setActiveWorkflowTab('brevo')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeWorkflowTab === 'brevo'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Brevo Communication ({notifications.length})
            </button>
          </div>
        </div>
      </div>

      {activeWorkflowTab === 'workflows' ? (
        <>
          {/* Visual n8n Workflows */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-cyan-400" />
              Configured n8n Production Workflows
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {wf.trigger}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {wf.schedule}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {wf.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {wf.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => handleTrigger(wf.id)}
                      disabled={triggeringId === wf.id}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all disabled:opacity-50 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{triggeringId === wf.id ? 'Executing...' : 'Trigger Now'}</span>
                    </button>
                  </div>

                  {/* Visual Node Diagram */}
                  <div className="mt-4 pt-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">
                      Pipeline Node Sequence:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {wf.nodes.map((node, i) => (
                        <React.Fragment key={i}>
                          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{node}</span>
                          </div>
                          {i < wf.nodes.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Execution Telemetry & Traces */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Live Workflow Execution Traces
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time execution telemetry, node duration latency, and input/output payloads.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {workflowLogs.length} logged runs
              </span>
            </div>

            <div className="space-y-3">
              {workflowLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-200">
                              {log.workflowName}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {log.durationMs}ms
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Trigger: {log.triggerSource} • {new Date(log.triggeredAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Payloads</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800/80 bg-slate-950 text-xs font-mono space-y-3 animate-in fade-in duration-150">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                            Input Payload:
                          </span>
                          <pre className="p-3 bg-slate-900 rounded-xl text-slate-300 overflow-x-auto text-[11px]">
                            {JSON.stringify(log.inputPayload, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">
                            Output Payload:
                          </span>
                          <pre className="p-3 bg-slate-900 rounded-xl text-emerald-300 overflow-x-auto text-[11px]">
                            {JSON.stringify(log.outputPayload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* BREVO COMMUNICATION TAB */
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  Brevo Dispatch History & Email Previews
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulated transactional messages dispatched to user email address with strict anti-spam frequency controls.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {notif.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        To: {notif.recipientEmail}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(notif.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      Subject: {notif.subject}
                    </h4>
                    <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      {notif.bodyPreview}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
