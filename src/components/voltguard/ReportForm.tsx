import { useState } from "react";
import { addReport } from "@/lib/voltguard/data";
import { toast } from "sonner";

const TYPES = ["Corte eléctrico", "Poste apagado", "Baja iluminación", "Riesgo eléctrico"];
const LOCS = ["Facultad de Ingeniería", "Facultad de Medicina", "Biblioteca Central", "Rectorado", "Estadio", "Comedor Universitario", "Facultad de Ciencias", "Facultad de Sistemas"];

export function ReportForm() {
  const [type, setType] = useState(TYPES[0]);
  const [location, setLocation] = useState(LOCS[0]);
  const [description, setDescription] = useState("");
  const [photoName, setPhotoName] = useState<string>("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!description.trim()) {
          toast.error("Describe el incidente");
          return;
        }
        addReport({ type, location, description, photo: photoName || undefined });
        toast.success("Reporte enviado", { description: `${type} · ${location}` });
        setDescription("");
        setPhotoName("");
      }}
      className="space-y-3 rounded-2xl border bg-card p-5"
    >
      <h3 className="text-lg font-bold">Nuevo reporte ciudadano</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-xs font-medium text-muted-foreground">Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-xs font-medium text-muted-foreground">Ubicación</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            {LOCS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-xs font-medium text-muted-foreground">Descripción</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Describe el incidente observado…" />
      </label>
      <label className="block text-sm">
        <span className="text-xs font-medium text-muted-foreground">Foto (opcional)</span>
        <input type="file" accept="image/*" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")} className="mt-1 block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground" />
      </label>
      <button type="submit" className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-volt)] transition hover:opacity-90">
        Enviar reporte
      </button>
    </form>
  );
}