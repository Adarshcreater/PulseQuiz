import Link from "next/link";
import { MonitorPlay, Shield, Smartphone } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <AppShell>
      <section className="grid flex-1 items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Real-time quiz platform</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-7xl">PulseQuiz</h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-white/70">
            A modern Kahoot-style experience with separate admin, projector, and mobile player screens.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href="/admin"><Shield className="h-5 w-5" /> Admin Panel</Link></Button>
            <Button asChild size="lg" variant="secondary"><Link href="/play"><Smartphone className="h-5 w-5" /> Join Quiz</Link></Button>
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <div className="aspect-[4/3] rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(32,211,238,0.24),rgba(244,63,94,0.18)),url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-white/10 p-3"><MonitorPlay className="mx-auto h-5 w-5 text-cyan-200" /><p className="mt-2 text-sm">Projector</p></div>
            <div className="rounded-md bg-white/10 p-3"><Smartphone className="mx-auto h-5 w-5 text-cyan-200" /><p className="mt-2 text-sm">Players</p></div>
            <div className="rounded-md bg-white/10 p-3"><Shield className="mx-auto h-5 w-5 text-cyan-200" /><p className="mt-2 text-sm">Admin</p></div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
