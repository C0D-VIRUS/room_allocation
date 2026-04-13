import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { DashboardCard } from "../components/DashboardCard";
import { EmptyState } from "../components/EmptyState";
import { SectionCard } from "../components/SectionCard";
import { StatusPill } from "../components/StatusPill";
import { fetchHealth, fetchSummary, type DashboardSummary, type HealthStatus } from "../lib/api";

const icons = [Users, Building2, MessageSquare, CreditCard];

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetchSummary().then(setSummary).catch(() => setSummary(null));
    fetchHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  const cards = [
    {
      title: "Students",
      value: String(summary?.students ?? 0),
      description: "Registered residents in the system",
      icon: icons[0]
    },
    {
      title: "Hostels",
      value: String(summary?.hostels ?? 0),
      description: "Managed hostel buildings",
      icon: icons[1]
    },
    {
      title: "Open Complaints",
      value: String(summary?.openComplaints ?? 0),
      description: "Complaints requiring attention",
      icon: icons[2]
    },
    {
      title: "Rooms",
      value: String(summary?.rooms ?? 0),
      description: "Total rooms in inventory",
      icon: icons[3]
    }
  ];

  const occupancyRate =
    summary && summary.rooms > 0 ? Math.min(100, Math.round((summary.students / summary.rooms) * 100)) : 0;

  const quickInsights = [
    {
      label: "Occupancy Pressure",
      value: `${occupancyRate}%`,
      tone: "from-sky-500 to-cyan-400"
    },
    {
      label: "Support Queue",
      value: `${summary?.openComplaints ?? 0} tickets`,
      tone: "from-amber-500 to-orange-400"
    },
    {
      label: "Hostel Coverage",
      value: `${summary?.hostels ?? 0} active blocks`,
      tone: "from-emerald-500 to-teal-400"
    }
  ];

  const quickActions = [
    {
      label: "Create a new student record",
      to: "/students"
    },
    {
      label: "Review room availability",
      to: "/rooms"
    },
    {
      label: "Assign a room allocation",
      to: "/allocations"
    },
    {
      label: "Check unresolved complaints",
      to: "/complaints"
    }
  ];

  return (
    <AppShell
      title="Dashboard"
      subtitle="A live admin workspace for your hostel management portal, showing current occupancy, complaint load, and operational readiness."
    >
      {!summary ? (
        <EmptyState
          title="Dashboard data is loading"
          description="Start the backend server to load live dashboard metrics and operational insights."
        />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <StatusPill
          label="API"
          value={health?.api ?? "unreachable"}
          tone={health?.api === "running" ? "success" : "warning"}
        />
        <StatusPill
          label="Database"
          value={health?.database ?? "unknown"}
          tone={health?.database === "connected" ? "success" : "warning"}
        />
        <StatusPill
          label="Mode"
          value={summary?.mode ?? "loading"}
          tone={summary?.mode === "database" ? "success" : "warning"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Operations Snapshot"
          description="A live control view for occupancy, support load, and overall system readiness."
        >
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#0f172a,#10213b)] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">System Mode</p>
                  <p className="mt-3 text-2xl font-semibold">{summary?.mode ?? "loading"}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-emerald-300" />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                The dashboard now reads directly from the connected database so student, room,
                complaint, and fee updates reflect here as live operational signals.
              </p>
            </div>

            <div className="space-y-3">
              {quickInsights.map((item) => (
                <div key={item.label} className="rounded-[1.35rem] border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{item.label}</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
                    </div>
                    <div className={`h-3 w-24 rounded-full bg-gradient-to-r ${item.tone}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Admin Priorities"
          description="Key workflows the admin team would focus on during day-to-day hostel operations."
        >
          <div className="space-y-3">
            {[
              {
                title: "Review room occupancy",
                detail: "Check which hostels are nearing capacity and route new allocations carefully.",
                icon: BedDouble
              },
              {
                title: "Resolve open complaints",
                detail: "Prioritize unresolved room issues to maintain resident satisfaction.",
                icon: MessageSquare
              },
              {
                title: "Track dues and records",
                detail: "Keep fee status and allocation history presentation-ready.",
                icon: CreditCard
              }
            ].map(({ title, detail, icon: Icon }) => (
              <div key={title} className="rounded-[1.3rem] border border-slate-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-950 p-3 text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="Operational Readiness"
          description="A simple visual read on how prepared the hostel system is for daily use."
        >
          <div className="space-y-5">
            {[
              {
                label: "Student records coverage",
                value: Math.min(100, (summary?.students ?? 0) * 15),
                accent: "bg-sky-500"
              },
              {
                label: "Hostel and room inventory setup",
                value: Math.min(100, (summary?.rooms ?? 0) * 20),
                accent: "bg-emerald-500"
              },
              {
                label: "Issue handling visibility",
                value: Math.max(25, 100 - (summary?.openComplaints ?? 0) * 8),
                accent: "bg-amber-500"
              }
            ].map((metric) => (
              <div key={metric.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{metric.label}</span>
                  <span className="text-slate-500">{metric.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full ${metric.accent}`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Quick Actions"
          description="The most useful pages for a live demo or hostel operations walkthrough."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center justify-between rounded-[1.35rem] border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
