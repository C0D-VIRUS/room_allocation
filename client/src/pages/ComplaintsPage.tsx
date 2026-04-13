import axios from "axios";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { SectionCard } from "../components/SectionCard";
import {
  createComplaint,
  deleteComplaint,
  fetchComplaints,
  fetchRooms,
  fetchStudents,
  type Complaint,
  type Room,
  type Student
} from "../lib/api";

export function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mode, setMode] = useState("loading");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [form, setForm] = useState({
    studentId: 1,
    roomId: 1,
    complaintType: "",
    description: "",
    status: "OPEN" as Complaint["status"]
  });

  async function loadData() {
    const [complaintsResponse, studentsResponse, roomsResponse] = await Promise.all([
      fetchComplaints(),
      fetchStudents(),
      fetchRooms()
    ]);

    setComplaints(complaintsResponse.data);
    setStudents(studentsResponse.data);
    setRooms(roomsResponse.data);
    setMode(complaintsResponse.mode);

    if (studentsResponse.data[0] && roomsResponse.data[0]) {
      setForm((current) => ({
        ...current,
        studentId: studentsResponse.data[0].id,
        roomId: roomsResponse.data[0].id
      }));
    }
  }

  useEffect(() => {
    loadData().catch(() => setMode("error"));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError("");

    try {
      await createComplaint(form);
      setForm((current) => ({
        ...current,
        complaintType: "",
        description: ""
      }));
      setFeedback("Complaint saved successfully.");
      await loadData();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to save complaint right now.");
        return;
      }

      setError("Unable to save complaint right now.");
    }
  }

  async function handleDelete(complaint: Complaint) {
    if (!window.confirm(`Delete ${complaint.complaintType} complaint for ${complaint.studentName}?`)) {
      return;
    }

    setBusyId(complaint.id);
    setFeedback("");
    setError("");

    try {
      await deleteComplaint(complaint.id);
      setFeedback("Complaint deleted successfully.");
      await loadData();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to delete complaint right now.");
      } else {
        setError("Unable to delete complaint right now.");
      }
    } finally {
      setBusyId(null);
    }
  }

  const filteredComplaints =
    statusFilter === "ALL"
      ? complaints
      : complaints.filter((complaint) => complaint.status === statusFilter);

  return (
    <AppShell
      title="Complaints"
      subtitle="Complaint tracking is now part of the website with links to students and rooms. This is useful both functionally and for showing relational database design in the final demo."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Raise Complaint" description={`Current source: ${mode}`}>
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
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.roomId}
              onChange={(event) => setForm({ ...form, roomId: Number(event.target.value) })}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomNumber}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Complaint type"
              value={form.complaintType}
              onChange={(event) => setForm({ ...form, complaintType: event.target.value })}
            />
            <textarea
              className="min-h-32 rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as Complaint["status"] })
              }
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white" type="submit">
              Save complaint
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Complaint Log" description="Raised complaints and current status">
          <div className="mb-4 flex flex-wrap gap-3">
            {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  statusFilter === value
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
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{complaint.studentName}</td>
                    <td className="py-3">{complaint.roomNumber}</td>
                    <td className="py-3">{complaint.complaintType}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          complaint.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : complaint.status === "IN_PROGRESS"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {complaint.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(complaint)}
                        disabled={busyId === complaint.id}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyId === complaint.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredComplaints.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No complaints match the selected status.</p>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
