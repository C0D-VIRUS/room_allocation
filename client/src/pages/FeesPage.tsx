import axios from "axios";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { SectionCard } from "../components/SectionCard";
import { createFee, deleteFee, fetchFees, fetchStudents, type Fee, type Student } from "../lib/api";

export function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [mode, setMode] = useState("loading");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [form, setForm] = useState({
    studentId: 1,
    amount: "",
    dueDate: "2026-04-30",
    paymentDate: "",
    paymentStatus: "PENDING" as Fee["paymentStatus"]
  });

  async function loadData() {
    const [feesResponse, studentsResponse] = await Promise.all([fetchFees(), fetchStudents()]);
    setFees(feesResponse.data);
    setStudents(studentsResponse.data);
    setMode(feesResponse.mode);

    if (studentsResponse.data[0]) {
      setForm((current) => ({
        ...current,
        studentId: studentsResponse.data[0].id
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
      await createFee({
        ...form,
        amount: Number(form.amount),
        paymentDate: form.paymentDate || null
      });
      setFeedback("Fee record saved successfully.");
      await loadData();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to save fee record right now.");
        return;
      }

      setError("Unable to save fee record right now.");
    }
  }

  async function handleDelete(fee: Fee) {
    if (!window.confirm(`Delete fee record for ${fee.studentName}?`)) {
      return;
    }

    setBusyId(fee.id);
    setFeedback("");
    setError("");

    try {
      await deleteFee(fee.id);
      setFeedback("Fee record deleted successfully.");
      await loadData();
    } catch (caughtError) {
      if (axios.isAxiosError(caughtError)) {
        setError(caughtError.response?.data?.message ?? "Unable to delete fee record right now.");
      } else {
        setError("Unable to delete fee record right now.");
      }
    } finally {
      setBusyId(null);
    }
  }

  const filteredFees =
    statusFilter === "ALL" ? fees : fees.filter((fee) => fee.paymentStatus === statusFilter);

  return (
    <AppShell
      title="Fees"
      subtitle="Fee records now have their own management page with status tracking. This covers another major DBMS entity from your project description."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Add Fee Record" description={`Current source: ${mode}`}>
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
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                type="date"
                value={form.paymentDate}
                onChange={(event) => setForm({ ...form, paymentDate: event.target.value })}
              />
            </div>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.paymentStatus}
              onChange={(event) =>
                setForm({ ...form, paymentStatus: event.target.value as Fee["paymentStatus"] })
              }
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white" type="submit">
              Save fee
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Fee Records" description="Payment status by student">
          <div className="mb-4 flex flex-wrap gap-3">
            {["ALL", "PENDING", "PAID", "OVERDUE"].map((value) => (
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
                {value}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{fee.studentName}</td>
                    <td className="py-3">Rs. {fee.amount.toLocaleString()}</td>
                    <td className="py-3">{String(fee.dueDate).slice(0, 10)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          fee.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : fee.paymentStatus === "OVERDUE"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {fee.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(fee)}
                        disabled={busyId === fee.id}
                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyId === fee.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredFees.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No fee records match the selected status.</p>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
