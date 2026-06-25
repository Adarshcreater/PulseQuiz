import Link from "next/link";
import { BarChart3, MonitorPlay, Play, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-300 text-slate-950">P</span>
          PulseQuiz
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link href="/play"><Play className="h-4 w-4" /> Play</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/projector"><MonitorPlay className="h-4 w-4" /> Projector</Link></Button>
          <Button asChild variant="secondary" size="sm"><Link href="/admin"><Shield className="h-4 w-4" /> Admin</Link></Button>
        </nav>
      </header>
      {children}
    </main>
  );
}

export function Stat({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: typeof BarChart3 }) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>{label}</span>
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
