import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Activity, AlertTriangle, Bell, Bolt, BrainCircuit, CheckCircle2, ClipboardList, Cpu, Gauge, Lightbulb, MapPin, Radio, ShieldAlert, Wrench, Zap } from "lucide-react";
import { LogOut } from "lucide-react";
import { store, tickRealtime, simulateEvent, useStore, setAlertState, setReportState, type Alert as AlertT } from "@/lib/voltguard/data";
import { GoogleCampusMap } from "@/components/voltguard/GoogleCampusMap";
import { SensorCharts } from "@/components/voltguard/SensorCharts";
import { ReportForm } from "@/components/voltguard/ReportForm";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import unmsmLogo from "@/assets/unmsm-logo.png.asset.json";
import citeLogo from "@/assets/cite-logo.png.asset.json";
import heroImg from "@/assets/hero.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoltGuard · Monitoreo Eléctrico Inteligente UNMSM" },
      { name: "description", content: "Plataforma de monitoreo predictivo de la red eléctrica del Smart Campus UNMSM con IoT, IA y reportes ciudadanos." },
      { property: "og:title", content: "VoltGuard · Smart Campus UNMSM" },
      { property: "og:description", content: "Monitoreo predictivo de fallas eléctricas con IoT e IA." },
    ],
  }),
  component: VoltGuardApp,
});

function VoltGuardApp() {
  useStore();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthChecked(true);
      if (!s) navigate({ to: "/auth" });
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
      if (!data.session) navigate({ to: "/auth" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const t1 = setInterval(tickRealtime, 3000);
    const t2 = setInterval(simulateEvent, 15000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  if (!authChecked) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Cargando…</div>;
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30 text-foreground">
      <Toaster position="top-right" richColors />
      <Header email={session.user.email ?? ""} />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <HeroBanner />
        <KPIGrid />
        <Section icon={<MapPin className="h-5 w-5" />} title="Mapa Inteligente del Campus" subtitle="Estado en tiempo real de los sectores monitoreados">
          <GoogleCampusMap />
        </Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Section icon={<BrainCircuit className="h-5 w-5" />} title="Predicción de Fallas" subtitle="Análisis IA basado en datos históricos y sensores">
            <AIPredictions />
          </Section>
          <Section icon={<Bell className="h-5 w-5" />} title="Alertas Activas" subtitle="Eventos detectados en la red">
            <AlertsPanel />
          </Section>
        </div>
        <Section icon={<Cpu className="h-5 w-5" />} title="Monitoreo de Sensores IoT" subtitle="Telemetría en vivo de la red eléctrica">
          <SensorCharts />
        </Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Section icon={<ClipboardList className="h-5 w-5" />} title="Reportes Ciudadanos" subtitle="Participación de la comunidad universitaria">
            <ReportForm />
          </Section>
          <Section icon={<Wrench className="h-5 w-5" />} title="Panel de Mantenimiento" subtitle="Gestión de incidencias y prioridades">
            <MaintenancePanel />
          </Section>
        </div>
        <footer className="border-t pt-6 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 opacity-80">
              <img src={unmsmLogo.url} alt="UNMSM" className="h-10 w-auto object-contain" loading="lazy" />
              <img src={citeLogo.url} alt="CITE" className="h-10 w-auto object-contain" loading="lazy" />
            </div>
            <p>VoltGuard · Smart Campus UNMSM · Simulación con IoT + IA + Participación Ciudadana</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border shadow-xl">
      <img src={heroImg.url} alt="Smart campus VoltGuard" className="h-56 w-full object-cover sm:h-72 md:h-80" width={1600} height={700} />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/70 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/95 p-2 shadow"><img src={unmsmLogo.url} alt="UNMSM" className="h-9 w-auto object-contain" /></div>
          <div className="rounded-xl bg-white/95 p-2 shadow"><img src={citeLogo.url} alt="CITE" className="h-9 w-auto object-contain" /></div>
        </div>
        <div className="max-w-2xl text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow">
            <Bolt className="h-3 w-3" /> Sistema activo · datos en vivo
          </span>
          <h2 className="mt-3 text-2xl font-black leading-tight sm:text-4xl">Ciudad Universitaria UNMSM<br/><span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">bajo monitoreo predictivo</span></h2>
          <p className="mt-2 max-w-lg text-sm text-white/85 sm:text-base">Detección temprana de fallas eléctricas mediante sensores IoT, inteligencia artificial y reportes ciudadanos.</p>
        </div>
      </div>
    </section>
  );
}

function Header({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-volt)] text-white shadow-[var(--shadow-volt)]">
            <Bolt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight sm:text-lg">VoltGuard</h1>
            <p className="text-[11px] text-muted-foreground">Smart Campus UNMSM · Monitoreo Predictivo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
            IoT activo
          </div>
          {email && <span className="hidden text-xs text-muted-foreground md:inline">{email}</span>}
          <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-muted" title="Cerrar sesión">
            <LogOut className="h-3.5 w-3.5" /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function KPIGrid() {
  const s = store;
  const cards = [
    { icon: Zap, label: "Voltaje promedio", value: `${s.kpis.voltage} V`, tone: "primary" },
    { icon: Gauge, label: "Consumo actual", value: `${s.kpis.consumption} kWh`, tone: "accent" },
    { icon: Lightbulb, label: "Luminarias operativas", value: `${s.kpis.luminaires}%`, tone: "success" },
    { icon: ShieldAlert, label: "Fallas detectadas", value: `${s.kpis.failures}`, tone: "danger" },
    { icon: AlertTriangle, label: "Alertas preventivas", value: `${s.kpis.preventiveAlerts}`, tone: "warning" },
    { icon: Radio, label: "Sectores monitoreados", value: `${s.kpis.sectors}`, tone: "muted" },
  ];
  const tones: Record<string, string> = {
    primary: "from-blue-500 to-cyan-500",
    accent: "from-indigo-500 to-blue-500",
    success: "from-emerald-500 to-teal-500",
    danger: "from-rose-500 to-red-500",
    warning: "from-amber-400 to-orange-500",
    muted: "from-slate-500 to-slate-600",
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <div key={c.label} className="group relative overflow-hidden rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${tones[c.tone]} opacity-20 blur-xl transition group-hover:opacity-40`} />
          <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${tones[c.tone]} text-white shadow`}>
            <c.icon className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
          <p className="mt-1 text-2xl font-black tracking-tight">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function AIPredictions() {
  useStore();
  const top = [...store.sectors].sort((a, b) => b.failureProb - a.failureProb).slice(0, 4);
  return (
    <div className="space-y-3">
      {top.map((s) => {
        const high = s.failureProb >= 70;
        const mid = s.failureProb >= 40;
        const color = high ? "bg-rose-500" : mid ? "bg-amber-400" : "bg-emerald-500";
        return (
          <div key={s.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.riskType} · estimado {s.estimatedDate}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-bold text-white ${color}`}>{s.failureProb}%</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${color} transition-all`} style={{ width: `${s.failureProb}%` }} />
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <BrainCircuit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{s.recommendation}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

const ALERT_STYLE: Record<AlertT["level"], { ring: string; text: string; label: string }> = {
  critica: { ring: "border-l-rose-500", text: "text-rose-700", label: "Crítica" },
  preventiva: { ring: "border-l-amber-500", text: "text-amber-700", label: "Preventiva" },
  informativa: { ring: "border-l-blue-500", text: "text-blue-700", label: "Informativa" },
};

function AlertsPanel() {
  useStore();
  return (
    <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-2xl border bg-card p-3">
      {store.alerts.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Sin alertas activas</p>}
      {store.alerts.map((a) => (
        <div key={a.id} className={`flex flex-col gap-2 rounded-lg border border-l-4 bg-background p-3 ${ALERT_STYLE[a.level].ring}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase ${ALERT_STYLE[a.level].text}`}>{ALERT_STYLE[a.level].label}</span>
                <span className="text-[11px] text-muted-foreground">{a.time}</span>
              </div>
              <p className="truncate text-sm font-medium">{a.description}</p>
              <p className="text-xs text-muted-foreground">{a.location}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${a.state === "resuelta" ? "bg-emerald-100 text-emerald-700" : a.state === "en_proceso" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
              {a.state === "en_proceso" ? "En proceso" : a.state[0].toUpperCase() + a.state.slice(1)}
            </span>
          </div>
          <div className="flex gap-1.5">
            {(["pendiente", "en_proceso", "resuelta"] as const).map((st) => (
              <button key={st} onClick={() => setAlertState(a.id, st)} className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${a.state === st ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                {st === "en_proceso" ? "En proceso" : st[0].toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MaintenancePanel() {
  useStore();
  const reports = store.reports;
  const pending = reports.filter((r) => r.state !== "resuelta").length;
  const resolved = reports.filter((r) => r.state === "resuelta").length;
  const avg = "32 min";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={<Activity className="h-4 w-4" />} label="Pendientes" value={pending} tone="bg-amber-500" />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Resueltas" value={resolved} tone="bg-emerald-500" />
        <Stat icon={<Wrench className="h-4 w-4" />} label="T. medio" value={avg} tone="bg-blue-500" />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Ubicación</th>
              <th className="px-3 py-2 text-left">Prioridad</th>
              <th className="px-3 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">Sin reportes registrados aún</td></tr>
            )}
            {reports.slice(0, 8).map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">{r.type}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.location}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.priority === "alta" ? "bg-rose-100 text-rose-700" : r.priority === "media" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{r.priority}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(["pendiente", "en_proceso", "resuelta"] as const).map((st) => (
                      <button key={st} onClick={() => setReportState(r.id, st)} className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${r.state === st ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}>
                        {st === "en_proceso" ? "En proceso" : st[0].toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <div className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-md ${tone} text-white`}>{icon}</div>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
