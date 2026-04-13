import { useEffect, useState } from "react";
import axios from "axios";
import { AppShell } from "../components/AppShell";
import { SectionCard } from "../components/SectionCard";
import {
  createAllocation,
  deleteAllocation,
  fetchAllocations,
  fetchHostels,
  fetchRooms,
  fetchStudents,
  type Allocation,
  type Hostel,
  type Room,
  type Student
} from "../lib/api";

export function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [mode, setMode] = useState("loading");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [form, setForm] = useState({
    studentId: 1,
    roomId: 1,
    hostelId: 1,
    startDate: "2026-04-08",
    endDate: "",
    status: "ACTIVE" as Allocation["status"]
  });

  async function loadData() {
    const [allocationsResponse, studentsResponse, roomsResponse, hostelsResponse] = await Promise.all([
      fetchAllocations(),
      fetchStudents(),
      fetchRooms(),
      fetchHostels()
    ]);

    setAllocations(allocationsResponse.data);
    setStudents(studentsResponse.data);
    setRooms(roomsResponse.data);
    setHostels(hostelsResponse.data);
    setMode(allocationsResponse.mode);

    if (studentsResponse.data[0] && roomsResponse.data[0] && hostelsResponse.data[0]) {
      setForm((current) => ({
        ...current,
        studentId: studentsResponse.data[0].id,
        roomId: roomsResponse.data[0].id,
        hostelId: hostelsResponse.data[0].id
      }));
    }
  }

  useEffect(() => {
    loadData().catch(() => setMode("error"));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");

    try {
      await createAllocation({
        ...form,
        endDate: form.endDate || null
      });
      setFeedback("Allocation saved successfully.");
      await loadData();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to create allocation right now.");
        return;
      }

      setError("Unable to create allocation right now.");
    }
  }

  async function handleDelete(allocation: Allocation) {
    if (!window.confirm(`Delete allocation for ${allocation.studentName}?`)) {
      return;
    }

    setBusyId(allocation.id);
    setFeedback("");
    setError("");

    try {
      await deleteAllocation(allocation.id);
      setFeedback("Allocation deleted successfully.");
      await loadData();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to delete allocation right now.");
      } else {
        setError("Unable to delete allocation right now.");
      }
    } finally {
      setBusyId(null);
    }
  }

  const selectedRoom = rooms.find((room) => room.id === form.roomId);
  const filteredRooms = rooms.filter((room) => room.hostelId === form.hostelId);

  return (
    <AppShell
      title="Allocations"
      subtitle="Room allocation and stay history now have a dedicated workflow. This is one of the most important modules for the final DBMS demo."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Create Allocation" description={`Current source: ${mode}`}>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            {feedback ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {feedback}
              </div>
            ) : null}
            {selectedRoom ? (
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Selected room occupancy: {selectedRoom.occupiedBeds}/{selectedRoom.capacity}
              </div>
            ) : null}
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.studentId}
              onChange={(event) => setForm({ ...form, studentId: Number(event.target.value) })}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
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
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.roomId}
                onChange={(event) => setForm({ ...form, roomId: Number(event.target.value) })}
              >
                {filteredRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} - {room.hostelName} ({room.occupiedBeds}/{room.capacity})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="date"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="date"
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              />
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as Allocation["status"] })
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <button className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white" type="submit">
              Save allocation
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Allocation Records" description="Current and historical room assignments">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Hostel</th>
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Occupancy</th>
                  <th className="pb-3">Start</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((allocation) => (
                  <tr key={allocation.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{allocation.studentName}</td>
                    <td className="py-3">{allocation.hostelName}</td>
                    <td className="py-3">{allocation.roomNumber}</td>
                    <td className="py-3">{allocation.roomOccupancy}</td>
                    <td className="py-3">{String(allocation.startDate).slice(0, 10)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          allocation.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : allocation.status === "COMPLETED"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {allocation.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(allocation)}
                        disabled={busyId === allocation.id}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyId === allocation.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {allocations.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No allocations have been created yet.</p>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
