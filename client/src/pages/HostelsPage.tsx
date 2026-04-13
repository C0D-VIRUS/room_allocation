import axios from "axios";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { SectionCard } from "../components/SectionCard";
import { createHostel, deleteHostel, fetchHostels, type Hostel } from "../lib/api";

const initialForm = {
  hostelName: "",
  block: "",
  capacity: "",
  address: ""
};

export function HostelsPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [mode, setMode] = useState("loading");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);

  async function loadHostels() {
    const response = await fetchHostels();
    setHostels(response.data);
    setMode(response.mode);
  }

  useEffect(() => {
    loadHostels().catch(() => {
      setHostels([]);
      setMode("error");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError("");

    try {
      await createHostel({
        ...form,
        capacity: Number(form.capacity)
      });
      setForm(initialForm);
      setFeedback("Hostel added successfully.");
      await loadHostels();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to save hostel right now.");
      } else {
        setError("Unable to save hostel right now.");
      }
    }
  }

  async function handleDelete(hostel: Hostel) {
    if (!window.confirm(`Delete ${hostel.hostelName} and all linked rooms, allocations, complaints, and fees?`)) {
      return;
    }

    setBusyId(hostel.id);
    setFeedback("");
    setError("");

    try {
      await deleteHostel(hostel.id);
      setFeedback("Hostel deleted successfully.");
      await loadHostels();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to delete hostel right now.");
      } else {
        setError("Unable to delete hostel right now.");
      }
    } finally {
      setBusyId(null);
    }
  }

  const filteredHostels = hostels.filter((hostel) => {
    const needle = query.toLowerCase();
    return (
      hostel.hostelName.toLowerCase().includes(needle) ||
      hostel.block.toLowerCase().includes(needle) ||
      hostel.address.toLowerCase().includes(needle)
    );
  });

  return (
    <AppShell
      title="Hostels"
      subtitle="Manage hostel buildings, capacity, and campus location data. This lays the foundation for allocation and occupancy workflows."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Add Hostel" description={`Current source: ${mode}`}>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            {feedback ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {feedback}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Hostel name"
              value={form.hostelName}
              onChange={(event) => setForm({ ...form, hostelName: event.target.value })}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Block"
                value={form.block}
                onChange={(event) => setForm({ ...form, block: event.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                placeholder="Capacity"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: event.target.value })}
              />
            </div>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Address"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
            />
            <button
              type="submit"
              className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white"
            >
              Save hostel
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Hostel Inventory" description="Hostel capacity and room counts">
          <div className="mb-4">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Search hostel, block, or address"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredHostels.map((hostel) => (
              <article
                key={hostel.id}
                className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{hostel.block}</p>
                <h4 className="mt-2 text-lg font-semibold text-slate-900">{hostel.hostelName}</h4>
                <p className="mt-2 text-sm text-slate-600">{hostel.address}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                    Capacity: {hostel.capacity}
                  </span>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    Rooms: {hostel.roomCount}
                  </span>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(hostel)}
                    disabled={busyId === hostel.id}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busyId === hostel.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {filteredHostels.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No hostels match your search.</p>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
