import axios from "axios";
import { Building2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@hostel.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      const target = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(target, { replace: true });
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError) && !caughtError.response) {
        setError("Backend server is not running. Start the server and try again.");
      } else {
        setError("Invalid credentials. Use the default admin login shown below.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-4rem] top-16 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/2 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <Sparkles className="h-4 w-4 text-amber-300" />
            Hostel Operations Platform
          </div>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight">
            Smarter room allocation for a cleaner hostel workflow.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Manage students, hostels, rooms, complaints, fees, and reporting from one admin
            dashboard built for clarity and speed.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <Building2 className="h-6 w-6 text-cyan-300" />
              <p className="mt-3 font-medium">Accommodation control</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              <p className="mt-3 font-medium">Admin-secured access</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <Sparkles className="h-6 w-6 text-amber-300" />
              <p className="mt-3 font-medium">Modern dashboard UX</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="rounded-[1.6rem] bg-white px-6 py-7 text-slate-900">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Admin Sign In</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use the admin login below to enter the management dashboard.
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
              />
              {error ? <p className="text-sm text-rose-500">{error}</p> : null}
              <button
                className="rounded-2xl bg-[linear-gradient(135deg,#0f172a,#115e59)] px-4 py-3 font-medium text-white shadow-lg shadow-slate-300"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Enter dashboard"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Admin credentials</p>
              <p className="mt-1">Email: admin@hostel.local</p>
              <p>Password: admin123</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
