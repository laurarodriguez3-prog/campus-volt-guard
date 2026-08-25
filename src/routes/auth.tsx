import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bolt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import unmsmLogo from "@/assets/unmsm-logo.png.asset.json";
import citeLogo from "@/assets/cite-logo.png.asset.json";
import heroImg from "@/assets/hero.jpg.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acceso · VoltGuard" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Cuenta creada", { description: "Revisa tu correo para confirmar." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error("Error de autenticación", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Toaster position="top-right" richColors />
      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroImg.url} alt="Smart campus" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-blue-800/75 to-emerald-700/70" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur"><Bolt className="h-6 w-6" /></div>
            <div>
              <p className="text-xl font-black">VoltGuard</p>
              <p className="text-xs text-white/80">Smart Campus UNMSM</p>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black leading-tight">Monitoreo eléctrico predictivo para Ciudad Universitaria</h2>
            <p className="text-white/80">IoT · Inteligencia Artificial · Participación ciudadana</p>
            <div className="flex items-center gap-4 pt-6">
              <div className="rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
                <img src={unmsmLogo.url} alt="UNMSM" className="h-12 w-auto object-contain" />
              </div>
              <div className="rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
                <img src={citeLogo.url} alt="CITE" className="h-12 w-auto object-contain" />
              </div>
            </div>
          </div>
          <p className="text-xs text-white/70">© {new Date().getFullYear()} VoltGuard · UNMSM</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-6 lg:hidden">
            <img src={unmsmLogo.url} alt="UNMSM" className="h-14 w-auto object-contain" />
            <img src={citeLogo.url} alt="CITE" className="h-14 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Accede al panel de monitoreo de VoltGuard</p>
          </div>
          <button onClick={handleGoogle} type="button" className="flex w-full items-center justify-center gap-2 rounded-md border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted">
            <svg viewBox="0 0 48 48" className="h-4 w-4"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.2 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.2 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C41.2 36 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
            Continuar con Google
          </button>
          <div className="relative flex items-center"><span className="flex-1 border-t" /><span className="px-3 text-xs text-muted-foreground">o con correo</span><span className="flex-1 border-t" /></div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@unmsm.edu.pe" className="w-full rounded-md border bg-background px-3 py-2.5 text-sm" />
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full rounded-md border bg-background px-3 py-2.5 text-sm" />
            <button disabled={loading} type="submit" className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-volt)] transition hover:opacity-90 disabled:opacity-50">
              {loading ? "Procesando…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "¿Sin cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-semibold text-primary hover:underline">
              {mode === "login" ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}