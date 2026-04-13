type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="motion-fade-up motion-delay-3 rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.82))] p-5 shadow-[0_18px_44px_rgba(148,163,184,0.16)] transition duration-300 hover:shadow-[0_22px_48px_rgba(148,163,184,0.2)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        <div className="hidden h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,#e0f2fe,#fef3c7)] sm:block" />
      </div>
      {children}
    </section>
  );
}
