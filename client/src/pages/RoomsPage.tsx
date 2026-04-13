import axios from "axios";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { SectionCard } from "../components/SectionCard";
import { createRoom, deleteRoom, fetchHostels, fetchRooms, type Hostel, type Room } from "../lib/api";

const initialForm = {
  roomNumber: "",
  floor: "",
  capacity: "",
  availability: "AVAILABLE" as Room["availability"],
  hostelId: 1
};

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [mode, setMode] = useState("loading");
  const [filter, setFilter] = useState("ALL");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);

  async function loadData() {
    const [roomResponse, hostelResponse] = await Promise.all([fetchRooms(), fetchHostels()]);
    setRooms(roomResponse.data);
    setHostels(hostelResponse.data);
    setMode(roomResponse.mode);
    if (hostelResponse.data.length > 0) {
      setForm((current) => ({ ...current, hostelId: hostelResponse.data[0].id }));
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      setRooms([]);
      setHostels([]);
      setMode("error");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError("");

    try {
      await createRoom({
        ...form,
        floor: Number(form.floor),
        capacity: Number(form.capacity)
      });
      setForm((current) => ({
        ...initialForm,
        hostelId: current.hostelId
      }));
      setFeedback("Room saved successfully.");
      await loadData();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to save room right now.");
      } else {
        setError("Unable to save room right now.");
      }
    }
  }

  async function handleDelete(room: Room) {
    if (!window.confirm(`Delete room ${room.roomNumber} and all linked allocations and complaints?`)) {
      return;
    }

    setBusyId(room.id);
    setFeedback("");
    setError("");

    try {
      await deleteRoom(room.id);
      setFeedback("Room deleted successfully.");
      await loadData();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to delete room right now.");
      } else {
        setError("Unable to delete room right now.");
      }
    } finally {
      setBusyId(null);
    }
  }

  const filteredRooms =
    filter === "ALL" ? rooms : rooms.filter((room) => room.availability === filter);

  return (
    <AppShell
      title="Rooms"
      subtitle="Track room capacity and availability across hostels. This module will later power room allocation, occupancy, and complaint linking."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Add Room" description={`Current source: ${mode}`}>
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
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Room number"
                value={form.roomNumber}
                onChange={(event) => setForm({ ...form, roomNumber: event.target.value })}
              />
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.hostelId}
                onChange={(event) => setForm({ ...form, hostelId: Number(event.target.value) })}
              >
                {hostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.hostelName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                placeholder="Floor"
                value={form.floor}
                onChange={(event) => setForm({ ...form, floor: event.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                placeholder="Capacity"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: event.target.value })}
              />
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.availability}
                onChange={(event) =>
                  setForm({ ...form, availability: event.target.value as Room["availability"] })
                }
              >
                <option value="AVAILABLE">Available</option>
                <option value="PARTIALLY_OCCUPIED">Partially Occupied</option>
                <option value="FULL">Full</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white"
            >
              Save room
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Room Inventory" description="Availability across all hostels">
          <div className="mb-4 flex flex-wrap gap-3">
            {["ALL", "AVAILABLE", "PARTIALLY_OCCUPIED", "FULL", "MAINTENANCE"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  filter === value
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {value.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Hostel</th>
                  <th className="pb-3">Floor</th>
                  <th className="pb-3">Occupied</th>
                  <th className="pb-3">Capacity</th>
                  <th className="pb-3">Availability</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{room.roomNumber}</td>
                    <td className="py-3">{room.hostelName}</td>
                    <td className="py-3">{room.floor}</td>
                    <td className="py-3">
                      {room.occupiedBeds}/{room.capacity}
                    </td>
                    <td className="py-3">{room.capacity}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          room.availability === "FULL"
                            ? "bg-rose-100 text-rose-700"
                            : room.availability === "PARTIALLY_OCCUPIED"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {room.availability.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(room)}
                        disabled={busyId === room.id}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyId === room.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRooms.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No rooms found for this availability filter.</p>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
