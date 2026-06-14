import { useEffect, useState } from "react";
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

type Point = { t: string; voltage: number; current: number; consumption: number; lux: number };

function seed(): Point[] {
  const now = Date.now();
  return Array.from({ length: 20 }, (_, i) => {
    const d = new Date(now - (19 - i) * 3000);
    return {
      t: d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      voltage: 218 + Math.random() * 4,
      current: 12 + Math.random() * 6,
      consumption: 1100 + Math.random() * 200,
      lux: 600 + Math.random() * 300,
    };
  });
}

export function SensorCharts() {
  const [data, setData] = useState<Point[]>(() => seed());
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const d = new Date();
        const next: Point = {
          t: d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          voltage: 218 + Math.random() * 4,
          current: 12 + Math.random() * 6,
          consumption: 1100 + Math.random() * 200,
          lux: 600 + Math.random() * 300,
        };
        return [...prev.slice(-19), next];
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const charts = [
    { key: "voltage", title: "Voltaje (V)", color: "oklch(0.55 0.22 250)", type: "line" as const },
    { key: "current", title: "Corriente (A)", color: "oklch(0.7 0.18 200)", type: "line" as const },
    { key: "consumption", title: "Consumo (kWh)", color: "oklch(0.7 0.18 155)", type: "bar" as const },
    { key: "lux", title: "Iluminación (lux)", color: "oklch(0.78 0.17 85)", type: "bar" as const },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {charts.map((c) => (
        <div key={c.key} className="rounded-2xl border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">{c.title}</h4>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: c.color }} /> en vivo
            </span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              {c.type === "line" ? (
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} hide />
                  <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              ) : (
                <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} hide />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey={c.key} fill={c.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}