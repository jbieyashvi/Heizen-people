"use client";

import { useMemo } from "react";
import { currentAgent } from "@/lib/roles/roles";
import { useAgentTickets } from "@/lib/agent/useAgentTickets";
import {
  computeAttention,
  computeRecentActivity,
  computeSlaHealth,
  computeTeamWorkload,
  computeWorklist,
  computeWorkload,
} from "@/lib/agent/agentTickets";
import { Panel } from "@/components/agent/Panel";
import { ErrorPanel } from "@/components/agent/AgentStates";
import { AgentDashboardHeader } from "@/components/agent/AgentDashboardHeader";
import { AttentionSummary } from "@/components/agent/AttentionSummary";
import { WorkloadSummary } from "@/components/agent/WorkloadSummary";
import { SlaHealthCard } from "@/components/agent/SlaHealthCard";
import { PriorityWorklist } from "@/components/agent/PriorityWorklist";
import { RecentActivityFeed } from "@/components/agent/RecentActivityFeed";
import { TeamWorkloadCard } from "@/components/agent/TeamWorkloadCard";

function DashboardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="h-14 w-72 rounded bg-slate-100" />
      <div className="h-16 rounded-lg bg-slate-100" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="h-96 rounded-lg bg-slate-100 lg:col-span-2" />
        <div className="h-96 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function AgentOverview() {
  const { tickets, state, now, reload } = useAgentTickets();
  const agentName = currentAgent.name;

  const derived = useMemo(() => {
    return {
      attention: computeAttention(tickets, agentName),
      workload: computeWorkload(tickets, agentName, now),
      slaHealth: computeSlaHealth(tickets),
      worklist: computeWorklist(tickets),
      recent: computeRecentActivity(tickets),
      team: computeTeamWorkload(tickets),
    };
  }, [tickets, agentName, now]);

  if (state === "loading") return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <AgentDashboardHeader now={now} />

      {state === "error" ? (
        <ErrorPanel onRetry={reload} />
      ) : (
        <>
          <AttentionSummary counts={derived.attention} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="flex flex-col gap-5 lg:col-span-2">
              <Panel title="My Workload">
                <WorkloadSummary metrics={derived.workload} />
              </Panel>
              <PriorityWorklist tickets={derived.worklist} />
            </div>

            <div className="flex flex-col gap-5 lg:col-span-1">
              <Panel title="SLA Health">
                <SlaHealthCard health={derived.slaHealth} />
              </Panel>
              <Panel title="Team Workload">
                <TeamWorkloadCard members={derived.team} />
              </Panel>
              <Panel title="Recent Activity">
                <RecentActivityFeed items={derived.recent} />
              </Panel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
