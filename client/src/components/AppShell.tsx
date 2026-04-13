import {
  BadgeCheck,
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Menu,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { fetchHealth, type HealthStatus } from "../lib/api";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/hostels", label: "Hostels", icon: Building2 },
  { to: "/rooms", label: "Rooms", icon: Menu },
  { to: "/allocations", label: "Allocations", icon: ClipboardList },
  { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/fees", label: "Fees", icon: CreditCard },
  { to: "/reports", label: "Reports", icon: LayoutDashboard }
];

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const { logout, user } = useAuth();
  const location = useLocation();
  const currentDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => setHealth(null));
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f8ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="motion-float-slow absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-[#c7d2fe] opacity-50 blur-3xl" />
        <div className="motion-float-delayed absolute right-[-6rem] top-20 h-64 w-64 rounded-full bg-[#fde68a] opacity-40 blur-3xl" />
        <div className="motion-float-slow absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-[#99f6e4] opacity-35 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-[1500px] gap-6 px-4 py-4 lg:px-6">
        <aside className="motion-fade-up hidden w-80 shrink-0 rounded-[2rem] border border-white/40 bg-[#0d1726] p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] lg:block">
          <Link
            to="/"
            className="block rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.32em] text-amber-300">Hostel Suite</p>
              <Sparkles className="h-4 w-4 text-teal-300" />
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">Hostel Room Allocation</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Admin workspace for accommodation, complaints, room planning, and fee monitoring.
            </p>
          </Link>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">System Status</p>
                <p className="text-xs text-slate-400">Live campus housing control</p>
                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                    <span>Signed in</span>
                    <span className="font-semibold text-white">{user?.name ?? "Admin"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                    <span>Role</span>
                    <span className="font-semibold text-emerald-300">{user?.role ?? "ADMIN"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                    <span>API</span>
                    <span className={health?.api === "running" ? "font-semibold text-emerald-300" : "font-semibold text-amber-300"}>
                      {health?.api ?? "checking"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                    <span>Database</span>
                    <span
                      className={
                        health?.database === "connected"
                          ? "font-semibold text-emerald-300"
                          : "font-semibold text-amber-300"
                      }
                    >
                      {health?.database ?? "checking"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    to="/"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-white/10"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/reports"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-white/10"
                  >
                    Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition duration-200 ${
                    isActive
                      ? "bg-[linear-gradient(135deg,#f97316,#fb7185)] text-white shadow-lg shadow-orange-500/25"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-amber-300" />
              <span>Modules live: Dashboard, Students, Hostels, Rooms, Allocations, Complaints, Fees, Reports</span>
            </div>
          </div>
        </aside>

        <div className="motion-fade-up motion-delay-1 flex-1">
          <div className="rounded-[2rem] border border-white/50 bg-white/55 p-4 shadow-[0_20px_60px_rgba(148,163,184,0.24)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="rounded-xl bg-slate-950 p-3 text-white shadow-lg"
              >
                <Menu className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-slate-500">Navigation</span>
            </div>

            {menuOpen ? (
              <nav className="mt-4 grid gap-2 lg:hidden">
                {links.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            ) : null}

            <header className="motion-fade-up motion-delay-2 mt-4 overflow-hidden rounded-[1.9rem] bg-[linear-gradient(135deg,#0f172a_0%,#132238_42%,#115e59_100%)] px-6 py-7 text-white shadow-[0_24px_60px_rgba(15,23,42,0.26)] lg:mt-0 lg:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Hostel Operations</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">{subtitle}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-teal-100">Admin</p>
                    <p className="mt-2 text-lg font-semibold">{user?.name ?? "Administrator"}</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.24em] text-teal-100">Date</p>
                    <p className="mt-2 text-lg font-semibold">{currentDate}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="motion-fade-up motion-delay-3 mt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                Log out
              </button>
            </div>

            <div className="motion-fade-up motion-delay-4 mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
