import axios from "axios";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { SectionCard } from "../components/SectionCard";
import { createStudent, deleteStudent, fetchStudents, type Student } from "../lib/api";

const initialForm = {
  fullName: "",
  age: "",
  gender: "MALE" as Student["gender"],
  course: "",
  academicYear: "",
  contactNumber: "",
  email: ""
};

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [mode, setMode] = useState("loading");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);

  async function loadStudents() {
    const response = await fetchStudents();
    setStudents(response.data);
    setMode(response.mode);
  }

  useEffect(() => {
    loadStudents().catch(() => {
      setStudents([]);
      setMode("error");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError("");

    try {
      await createStudent({
        ...form,
        age: Number(form.age),
        academicYear: Number(form.academicYear),
        email: form.email || null
      });
      setForm(initialForm);
      setFeedback("Student saved successfully.");
      await loadStudents();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to save student right now.");
        return;
      }

      setError("Unable to save student right now.");
    }
  }

  async function handleDelete(student: Student) {
    if (!window.confirm(`Delete ${student.fullName} and all linked records?`)) {
      return;
    }

    setBusyId(student.id);
    setFeedback("");
    setError("");

    try {
      await deleteStudent(student.id);
      setFeedback("Student deleted successfully.");
      await loadStudents();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to delete student right now.");
      } else {
        setError("Unable to delete student right now.");
      }
    } finally {
      setBusyId(null);
    }
  }

  const filteredStudents = students.filter((student) => {
    const needle = query.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(needle) ||
      student.course.toLowerCase().includes(needle) ||
      student.contactNumber.includes(query)
    );
  });

  return (
    <AppShell
      title="Students"
      subtitle="Manage hostel student records with a clean creation flow, searchable listings, and admin-controlled record management."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(380px,420px)_minmax(0,1fr)]">
        <SectionCard title="Add Student" description={`Current source: ${mode}`}>
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
              placeholder="Full name"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Course"
                value={form.course}
                onChange={(event) => setForm({ ...form, course: event.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Contact number"
                value={form.contactNumber}
                onChange={(event) => setForm({ ...form, contactNumber: event.target.value })}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={(event) => setForm({ ...form, age: event.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                placeholder="Year"
                value={form.academicYear}
                onChange={(event) =>
                  setForm({ ...form, academicYear: event.target.value })
                }
              />
              <select
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.gender}
                onChange={(event) =>
                  setForm({ ...form, gender: event.target.value as Student["gender"] })
                }
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <button
              type="submit"
              className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white"
            >
              Save student
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Student Records" description="Recent student entries">
          <div className="mb-4">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Search by name, course, or contact"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 pr-6">Name</th>
                  <th className="pb-3 pr-6">Course</th>
                  <th className="pb-3 pr-4 text-center">Age</th>
                  <th className="pb-3 pr-4 text-center">Year</th>
                  <th className="pb-3 pr-6">Gender</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-t border-slate-100">
                    <td className="py-3 pr-6 font-medium text-slate-800">{student.fullName}</td>
                    <td className="py-3 pr-6">{student.course}</td>
                    <td className="py-3 pr-4 text-center">{student.age}</td>
                    <td className="py-3 pr-4 text-center">{student.academicYear}</td>
                    <td className="py-3 pr-6">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3">{student.contactNumber}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(student)}
                        disabled={busyId === student.id}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyId === student.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No students match your search yet.</p>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
