import { useEffect, useRef, useState } from "react";
import { store, useStore, type Sector } from "@/lib/voltguard/data";

// UNMSM Ciudad Universitaria approx coords
const CAMPUS_CENTER = { lat: -12.0570, lng: -77.0851 };

const SECTOR_COORDS: Record<string, { lat: number; lng: number }> = {
  ing: { lat: -12.0588, lng: -77.0855 },
  med: { lat: -12.0568, lng: -77.0828 },
  bib: { lat: -12.0572, lng: -77.0848 },
  rec: { lat: -12.0556, lng: -77.0859 },
  est: { lat: -12.0552, lng: -77.0820 },
  com: { lat: -12.0594, lng: -77.0840 },
  cie: { lat: -12.0582, lng: -77.0876 },
  sis: { lat: -12.0561, lng: -77.0875 },
};

const STATUS_COLOR: Record<Sector["status"], string> = {
  operativo: "#10b981",
  riesgo: "#f59e0b",
  falla: "#ef4444",
};
const STATUS_LABEL: Record<Sector["status"], string> = {
  operativo: "Operativo",
  riesgo: "Riesgo Moderado",
  falla: "Falla Detectada",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any;
    initVoltMap?: () => void;
  }
}

let mapsLoading: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (mapsLoading) return mapsLoading;
  mapsLoading = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) return reject(new Error("Falta clave de Google Maps"));
    window.initVoltMap = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=initVoltMap${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(s);
  });
  return mapsLoading;
}

export function GoogleCampusMap() {
  useStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [selected, setSelected] = useState<string>("ing");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        mapRef.current = new window.google.maps.Map(containerRef.current, {
          center: CAMPUS_CENTER,
          zoom: 16,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c1a2e" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e3a5f" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#064e3b" }] },
          ],
        });
        // initial markers
        for (const s of store.sectors) {
          const pos = SECTOR_COORDS[s.id];
          if (!pos) continue;
          const marker = new window.google.maps.Marker({
            position: pos,
            map: mapRef.current,
            title: s.name,
            icon: makeIcon(s.status),
          });
          marker.addListener("click", () => setSelected(s.id));
          markersRef.current[s.id] = marker;
        }
      })
      .catch((e) => setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, []);

  // update marker icons when sector statuses change
  useEffect(() => {
    for (const s of store.sectors) {
      const m = markersRef.current[s.id];
      if (m) m.setIcon(makeIcon(s.status));
    }
  });

  const sector = store.sectors.find((s) => s.id === selected)!;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border bg-slate-900 shadow-[var(--shadow-volt)]">
        {error && (
          <div className="absolute inset-0 z-10 grid place-items-center p-6 text-center text-sm text-white">
            <div>
              <p className="font-semibold">No se pudo cargar Google Maps</p>
              <p className="mt-1 text-xs text-white/70">{error}</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
          UNMSM · Ciudad Universitaria
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 flex gap-3 rounded-md bg-slate-900/80 px-2 py-1 text-[11px] text-white backdrop-blur">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR.operativo }} /> Operativo</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR.riesgo }} /> Riesgo</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR.falla }} /> Falla</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Sector</p>
            <h3 className="text-lg font-bold">{sector.name}</h3>
          </div>
          <span className="rounded-full px-2 py-1 text-xs font-medium text-white" style={{ background: STATUS_COLOR[sector.status] }}>
            {STATUS_LABEL[sector.status]}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">Voltaje</dt><dd className="text-lg font-semibold">{sector.voltage} V</dd></div>
          <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">Consumo</dt><dd className="text-lg font-semibold">{sector.consumption} kWh</dd></div>
          <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">Luminarias</dt><dd className="text-lg font-semibold">{sector.luminairesPct}%</dd></div>
          <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">Nivel de riesgo</dt><dd className="text-lg font-semibold">{Math.round(sector.riskLevel)}/100</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Última inspección: <span className="font-medium text-foreground">{sector.lastInspection}</span></p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {store.sectors.map((s) => (
            <button key={s.id} onClick={() => { setSelected(s.id); const m = markersRef.current[s.id]; if (m && mapRef.current) { mapRef.current.panTo(m.getPosition()!); mapRef.current.setZoom(17);} }} className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${selected === s.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}>
              {s.name.replace("Facultad de ", "Fac. ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function makeIcon(status: Sector["status"]): any {
  return {
    path: window.google!.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: STATUS_COLOR[status],
    fillOpacity: 0.95,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };
}