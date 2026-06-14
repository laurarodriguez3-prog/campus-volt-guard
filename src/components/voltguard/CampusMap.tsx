import { useState } from "react";
import { store, useStore, type Sector } from "@/lib/voltguard/data";

const statusColor: Record<Sector["status"], string> = {
  operativo: "fill-emerald-500",
  riesgo: "fill-amber-400",
  falla: "fill-rose-500",
};
const statusLabel: Record<Sector["status"], string> = {
  operativo: "Operativo",
  riesgo: "Riesgo Moderado",
  falla: "Falla Detectada",
};

export function CampusMap() {
  useStore();
  const [selected, setSelected] = useState<string>("ing");
  const sector = store.sectors.find((s) => s.id === selected)!;
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[var(--shadow-volt)]">
        {/* grid lines */}
        <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* roads */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-blue-400/30" />
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-blue-400/30" />

        {/* sector dots */}
        {store.sectors.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-label={s.name}
          >
            <span className={`absolute inset-0 -m-3 animate-ping rounded-full ${s.status === "falla" ? "bg-rose-500/40" : s.status === "riesgo" ? "bg-amber-400/30" : "bg-emerald-500/20"}`} />
            <svg viewBox="0 0 20 20" className={`relative h-5 w-5 ${statusColor[s.status]} drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`}>
              <circle cx="10" cy="10" r="6" />
              <circle cx="10" cy="10" r="9" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
            </svg>
            <span className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-medium ${selected === s.id ? "bg-white text-slate-900" : "bg-slate-900/70 text-slate-100"}`}>
              {s.name.replace("Facultad de ", "Fac. ")}
            </span>
          </button>
        ))}

        <div className="absolute left-3 top-3 rounded-md bg-slate-900/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
          UNMSM · Ciudad Universitaria
        </div>
        <div className="absolute bottom-3 left-3 flex gap-3 rounded-md bg-slate-900/70 px-2 py-1 text-[11px] text-white backdrop-blur">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Operativo</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Riesgo</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Falla</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Sector</p>
            <h3 className="text-lg font-bold">{sector.name}</h3>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${sector.status === "falla" ? "bg-rose-100 text-rose-700" : sector.status === "riesgo" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
            {statusLabel[sector.status]}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Voltaje</dt>
            <dd className="text-lg font-semibold">{sector.voltage} V</dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Consumo</dt>
            <dd className="text-lg font-semibold">{sector.consumption} kWh</dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Luminarias</dt>
            <dd className="text-lg font-semibold">{sector.luminairesPct}%</dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Nivel de riesgo</dt>
            <dd className="text-lg font-semibold">{Math.round(sector.riskLevel)}/100</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Última inspección: <span className="font-medium text-foreground">{sector.lastInspection}</span></p>
      </div>
    </div>
  );
}