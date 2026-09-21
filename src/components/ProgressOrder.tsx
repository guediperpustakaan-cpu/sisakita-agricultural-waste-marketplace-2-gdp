import { LABEL_STATUS_ORDER, TAHAP_ORDER } from "@/lib/utils";

export default function ProgressOrder({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return <span className="badge bg-red-100 text-red-700">Dibatalkan</span>;
  }
  const idx = TAHAP_ORDER.indexOf(status);
  return (
    <div>
      <div className="flex items-center gap-1">
        {TAHAP_ORDER.map((t, i) => (
          <div key={t} className={`h-2 flex-1 rounded-full ${i <= idx ? "bg-[#2f8f2f]" : "bg-slate-200"}`} />
        ))}
      </div>
      <p className="mt-1 text-xs font-medium text-slate-600">{LABEL_STATUS_ORDER[status] ?? status}</p>
    </div>
  );
}
