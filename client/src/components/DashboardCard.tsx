import type { LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export function DashboardCard({ title, value, description, icon: Icon }: DashboardCardProps) {
  return (
    <div className="motion-fade-up motion-delay-2 group rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.76))] p-5 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(14,116,144,0.18)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className="rounded-[1.2rem] bg-[linear-gradient(135deg,#fff7ed,#dbeafe)] p-3 text-slate-900 ring-1 ring-slate-100">
          <Icon className="h-6 w-6 transition duration-300 group-hover:scale-110" />
        </div>
      </div>
      <div className="mt-5 h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
