"use client";

import Link from "next/link";
import { Copy, Download, FilePlus2, LogOut, Play, Plus, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Quiz } from "@/lib/types";

export function AdminDashboard({ quizzes: initial }: { quizzes: Quiz[] }) {
  const [quizzes, setQuizzes] = useState(initial);
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => quizzes.filter((quiz) => `${quiz.title} ${quiz.description}`.toLowerCase().includes(query.toLowerCase())), [quizzes, query]);

  async function refresh() {
    const data = await api<{ quizzes: Quiz[] }>("/api/quizzes");
    setQuizzes(data.quizzes);
  }

  async function createDemo() {
    await api("/api/quizzes/demo", { method: "POST" });
    toast.success("Demo quiz created");
    refresh();
  }

  async function remove(id: string) {
    await api(`/api/quizzes/${id}`, { method: "DELETE" });
    toast.success("Quiz deleted");
    refresh();
  }

  async function duplicate(id: string) {
    await api(`/api/quizzes/${id}/duplicate`, { method: "POST" });
    toast.success("Quiz duplicated");
    refresh();
  }

  async function start(quizId: string) {
    const { session } = await api<{ session: { code: string } }>("/api/sessions", { method: "POST", body: JSON.stringify({ quizId }) });
    window.location.href = `/admin/live/${session.code}`;
  }

  async function importJson(file: File) {
    const text = await file.text();
    await api("/api/quizzes/import", { method: "POST", body: text });
    toast.success("Quiz imported");
    refresh();
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/45" />
          <Input className="pl-9" placeholder="Search quizzes" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button asChild><Link href="/admin/quizzes/new"><Plus className="h-4 w-4" /> Create Quiz</Link></Button>
        <Button variant="secondary" onClick={createDemo}><FilePlus2 className="h-4 w-4" /> Demo Quiz</Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import JSON</Button>
        <Button variant="ghost" onClick={() => api("/api/admin/logout", { method: "POST" }).then(() => location.href = "/admin/login")}><LogOut className="h-4 w-4" /></Button>
        <input ref={fileRef} hidden type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
      </div>
      <div className="grid gap-4">
        {filtered.map((quiz) => (
          <article key={quiz.id} className="glass rounded-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">{quiz.title}</h2>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs uppercase text-white/65">{quiz.status}</span>
                </div>
                <p className="mt-2 max-w-3xl text-white/65">{quiz.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => start(quiz.id)}><Play className="h-4 w-4" /> Start</Button>
                <Button asChild size="sm" variant="secondary"><Link href={`/admin/quizzes/${quiz.id}`}>Edit</Link></Button>
                <Button asChild size="sm" variant="secondary"><a href={`/api/quizzes/${quiz.id}/export`}><Download className="h-4 w-4" /></a></Button>
                <Button size="sm" variant="secondary" onClick={() => duplicate(quiz.id)}><Copy className="h-4 w-4" /></Button>
                <Button size="sm" variant="danger" onClick={() => remove(quiz.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
