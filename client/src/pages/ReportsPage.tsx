import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { DashboardCard } from "../components/DashboardCard";
import { EmptyState } from "../components/EmptyState";
import { SectionCard } from "../components/SectionCard";
import { Building2, ClipboardList, CreditCard, MessageSquareWarning, TrendingUp } from "lucide-react";
import { fetchReportOverview, type ReportOverview } from "../lib/api";

export function ReportsPage() {
  const [report, setReport] = useState<ReportOverview | null>(null);

  useEffect(() => {
    fetchReportOverview().then(setReport).catch(() => setReport(null));
  }, []);

  const cards = [
    {
      title: "Active Allocations",
      value: String(report?.activeAllocations ?? 0),
      description: "Current student room assignments",
      icon: ClipboardList
    },
    {
      title: "Open Complaints",
      value: String(report?.openComplaints ?? 0),
      description: "Issues not resolved yet",
      icon: MessageSquareWarning
    },
    {
      title: "Pending Fees",
      value: String(report?.pendingFees ?? 0),
      description: "Students with unpaid or overdue fees",
      icon: CreditCard
    },
    {
      title: "Occupancy Rate",
      value: `${report?.occupancyRate ?? 0}%`,
      description: "Approximate room occupancy",
      icon: Building2
    }
  ];

  const reportSeries = [
    { label: "Allocations", value: report?.activeAllocations ?? 0, color: "bg-sky-500" },
    { label: "Complaints", value: report?.openComplaints ?? 0, color: "bg-amber-500" },
    { label: "Pending Fees", value: report?.pendingFees ?? 0, color: "bg-rose-500" }
  ];
  const maxSeriesValue = Math.max(...reportSeries.map((item) => item.value), 1);

  return (
    <AppShell
      title="Reports"
      subtitle="This overview page pulls together key hostel metrics and makes the project feel much more complete during presentation and demo."
    >
      {!report ? (
        <EmptyState
          title="Reports are waiting for data"
          description="Start the backend server to populate the analytics dashboard and report summaries."
        />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Overview Summary" description={`Current source: ${report?.mode ?? "loading"}`}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="mt-2 text-3xl font-semibold">{report?.totalStudents ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total Hostels</p>
              <p className="mt-2 text-3xl font-semibold">{report?.totalHostels ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Total Rooms</p>
              <p className="mt-2 text-3xl font-semibold">{report?.totalRooms ?? 0}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] bg-[linear-gradient(135deg,#0f172a,#132238)] p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-sky-200">Performance Insight</p>
                <p className="mt-3 text-2xl font-semibold">Occupancy is at {report?.occupancyRate ?? 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-300" />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              This gives a strong high-level view of how intensively the hostel rooms are being used and
              whether more capacity planning is needed.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Activity Mix" description="Relative weight of core operational metrics">
          <div className="space-y-5">
            {reportSeries.map((item) => {
              const width = Math.max(12, Math.round((item.value / maxSeriesValue) * 100));

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3">
            {[
              {
                title: "Capacity posture",
                detail:
                  (report?.occupancyRate ?? 0) > 75
                    ? "Hostel utilization is high and new allocations should be monitored closely."
                    : "There is still comfortable room availability across the hostel network."
              },
              {
                title: "Operations pressure",
                detail:
                  (report?.openComplaints ?? 0) > 5
                    ? "Complaint load is significant and should be reviewed during admin rounds."
                    : "Complaint load is manageable at the moment."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[1.2rem] border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
