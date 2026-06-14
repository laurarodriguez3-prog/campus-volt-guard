import { create } from "zustand";

// Lightweight pub/sub without zustand dependency
export type SectorStatus = "operativo" | "riesgo" | "falla";
export interface Sector {
  id: string;
  name: string;
  x: number; // % position on map
  y: number;
  voltage: number;
  consumption: number;
  luminairesPct: number;
  riskLevel: number; // 0-100
  lastInspection: string;
  status: SectorStatus;
  failureProb: number;
  riskType: string;
  recommendation: string;
  estimatedDate: string;
}

export interface Alert {
  id: string;
  level: "critica" | "preventiva" | "informativa";
  location: string;
  time: string;
  description: string;
  state: "pendiente" | "en_proceso" | "resuelta";
}

export interface Report {
  id: string;
  type: string;
  location: string;
  description: string;
  photo?: string;
  date: string;
  state: "pendiente" | "en_proceso" | "resuelta";
  priority: "alta" | "media" | "baja";
}

export const INITIAL_SECTORS: Sector[] = [
  { id: "ing", name: "Facultad de Ingeniería", x: 22, y: 30, voltage: 220, consumption: 185, luminairesPct: 96, riskLevel: 78, lastInspection: "2025-06-10", status: "falla", failureProb: 82, riskType: "Sobrecarga eléctrica", recommendation: "Revisar tablero principal en las próximas 24 horas.", estimatedDate: "2025-06-15" },
  { id: "med", name: "Facultad de Medicina", x: 70, y: 22, voltage: 219, consumption: 142, luminairesPct: 98, riskLevel: 22, lastInspection: "2025-06-11", status: "operativo", failureProb: 18, riskType: "Sin riesgo significativo", recommendation: "Mantenimiento preventivo programado.", estimatedDate: "2025-07-01" },
  { id: "bib", name: "Biblioteca Central", x: 50, y: 50, voltage: 221, consumption: 98, luminairesPct: 94, riskLevel: 45, lastInspection: "2025-06-09", status: "riesgo", failureProb: 54, riskType: "Variación de voltaje", recommendation: "Estabilizar línea principal.", estimatedDate: "2025-06-20" },
  { id: "rec", name: "Rectorado", x: 38, y: 18, voltage: 220, consumption: 75, luminairesPct: 100, riskLevel: 12, lastInspection: "2025-06-12", status: "operativo", failureProb: 9, riskType: "Sin riesgo", recommendation: "Operación normal.", estimatedDate: "—" },
  { id: "est", name: "Estadio", x: 82, y: 62, voltage: 218, consumption: 210, luminairesPct: 88, riskLevel: 60, lastInspection: "2025-06-08", status: "riesgo", failureProb: 62, riskType: "Caída de tensión", recommendation: "Inspección de luminarias norte.", estimatedDate: "2025-06-18" },
  { id: "com", name: "Comedor Universitario", x: 28, y: 70, voltage: 220, consumption: 130, luminairesPct: 92, riskLevel: 30, lastInspection: "2025-06-11", status: "operativo", failureProb: 25, riskType: "Carga estable", recommendation: "Sin acción inmediata.", estimatedDate: "—" },
  { id: "cie", name: "Facultad de Ciencias", x: 60, y: 78, voltage: 222, consumption: 156, riskLevel: 55, luminairesPct: 95, lastInspection: "2025-06-10", status: "riesgo", failureProb: 48, riskType: "Calentamiento de cableado", recommendation: "Termografía recomendada.", estimatedDate: "2025-06-22" },
  { id: "sis", name: "Facultad de Sistemas", x: 14, y: 52, voltage: 220, consumption: 168, luminairesPct: 97, riskLevel: 35, lastInspection: "2025-06-12", status: "operativo", failureProb: 28, riskType: "Carga moderada", recommendation: "Monitoreo continuo.", estimatedDate: "—" },
];

export const INITIAL_ALERTS: Alert[] = [
  { id: "a1", level: "critica", location: "Facultad de Ingeniería", time: "10:42", description: "Sobrecarga detectada en tablero TG-01", state: "pendiente" },
  { id: "a2", level: "preventiva", location: "Estadio", time: "10:31", description: "Caída leve de tensión en sector norte", state: "en_proceso" },
  { id: "a3", level: "preventiva", location: "Biblioteca Central", time: "10:15", description: "Variación de voltaje fuera de rango óptimo", state: "pendiente" },
  { id: "a4", level: "informativa", location: "Comedor Universitario", time: "09:58", description: "Consumo elevado en horario pico", state: "resuelta" },
  { id: "a5", level: "preventiva", location: "Facultad de Ciencias", time: "09:40", description: "Calentamiento detectado por sensor IR-12", state: "en_proceso" },
];

let listeners: Array<() => void> = [];
const subscribe = (l: () => void) => {
  listeners.push(l);
  return () => {
    listeners = listeners.filter((x) => x !== l);
  };
};
const notify = () => listeners.forEach((l) => l());

export const store = {
  sectors: [...INITIAL_SECTORS],
  alerts: [...INITIAL_ALERTS],
  reports: [] as Report[],
  kpis: {
    voltage: 220,
    consumption: 1245,
    luminaires: 96,
    failures: 3,
    preventiveAlerts: 5,
    sectors: 12,
  },
  subscribe,
  notify,
};

// silence unused import
void create;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export function tickRealtime() {
  store.kpis.voltage = +(218 + rand(0, 4)).toFixed(1);
  store.kpis.consumption = Math.round(1200 + rand(0, 120));
  store.kpis.luminaires = +(94 + rand(0, 4)).toFixed(0);
  store.sectors = store.sectors.map((s) => ({
    ...s,
    voltage: +(s.voltage + rand(-1.5, 1.5)).toFixed(1),
    consumption: Math.max(40, Math.round(s.consumption + rand(-8, 8))),
    riskLevel: Math.max(0, Math.min(100, s.riskLevel + rand(-3, 3))),
  }));
  notify();
}

const EVENT_LOCS = ["Facultad de Ingeniería", "Estadio", "Biblioteca Central", "Comedor Universitario", "Facultad de Ciencias", "Facultad de Sistemas"];
const ALERT_DESCS = [
  "Pico de corriente detectado",
  "Sensor IoT sin respuesta",
  "Luminaria fuera de servicio",
  "Fluctuación de voltaje",
  "Aumento de temperatura en transformador",
];
const REPORT_TYPES = ["Corte eléctrico", "Poste apagado", "Baja iluminación", "Riesgo eléctrico"];

export function simulateEvent() {
  const r = Math.random();
  if (r < 0.35) {
    // new alert
    const levels: Alert["level"][] = ["critica", "preventiva", "informativa"];
    const newAlert: Alert = {
      id: "a" + Date.now(),
      level: levels[Math.floor(Math.random() * levels.length)],
      location: EVENT_LOCS[Math.floor(Math.random() * EVENT_LOCS.length)],
      time: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
      description: ALERT_DESCS[Math.floor(Math.random() * ALERT_DESCS.length)],
      state: "pendiente",
    };
    store.alerts = [newAlert, ...store.alerts].slice(0, 20);
    store.kpis.preventiveAlerts = store.alerts.filter((a) => a.level === "preventiva" && a.state !== "resuelta").length;
  } else if (r < 0.55) {
    // citizen report
    const newRep: Report = {
      id: "r" + Date.now(),
      type: REPORT_TYPES[Math.floor(Math.random() * REPORT_TYPES.length)],
      location: EVENT_LOCS[Math.floor(Math.random() * EVENT_LOCS.length)],
      description: "Reporte automático generado por la comunidad",
      date: new Date().toLocaleString("es-PE"),
      state: "pendiente",
      priority: (["alta", "media", "baja"] as const)[Math.floor(Math.random() * 3)],
    };
    store.reports = [newRep, ...store.reports].slice(0, 50);
  } else if (r < 0.75) {
    // shift a sector status
    const idx = Math.floor(Math.random() * store.sectors.length);
    const states: SectorStatus[] = ["operativo", "riesgo", "falla"];
    store.sectors[idx] = {
      ...store.sectors[idx],
      status: states[Math.floor(Math.random() * states.length)],
      failureProb: Math.round(rand(10, 95)),
    };
    store.kpis.failures = store.sectors.filter((s) => s.status === "falla").length;
  } else {
    // consumption spike
    store.kpis.consumption = Math.round(store.kpis.consumption + rand(50, 200));
  }
  notify();
}

export function addReport(r: Omit<Report, "id" | "date" | "state" | "priority">) {
  const rep: Report = {
    ...r,
    id: "r" + Date.now(),
    date: new Date().toLocaleString("es-PE"),
    state: "pendiente",
    priority: "media",
  };
  store.reports = [rep, ...store.reports];
  notify();
  return rep;
}

export function setAlertState(id: string, state: Alert["state"]) {
  store.alerts = store.alerts.map((a) => (a.id === id ? { ...a, state } : a));
  notify();
}

export function setReportState(id: string, state: Report["state"]) {
  store.reports = store.reports.map((r) => (r.id === id ? { ...r, state } : r));
  notify();
}

export function useStore() {
  const [, setN] = (require("react") as typeof import("react")).useState(0);
  (require("react") as typeof import("react")).useEffect(() => store.subscribe(() => setN((n) => n + 1)), []);
  return store;
}