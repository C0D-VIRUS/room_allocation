type StatusPillProps = {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
};

export function StatusPill({ label, value, tone = "neutral" }: StatusPillProps) {
  const classes =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "warning"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return (
    <div className={`rounded-full px-3 py-2 text-xs font-semibold ${classes}`}>
      <span className="mr-2 uppercase tracking-[0.18em] opacity-70">{label}</span>
      <span>{value}</span>
    </div>
  );
}
