"use client";

import Link from "next/link";
import { BarChart3, Download, MonitorPlay, Pause, Play, RotateCcw, StepForward, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { api, useLiveSession } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/shell";
import type { SessionSnapshot } from "@/lib/types";

export function LiveAdmin({ code, initial }: { code: string; initial: SessionSnapshot | null }) {
  const { snapshot, offline } = useLiveSession(code, initial);

  async function action(path: string, body?: unknown) {
    try {
      await api(`/api/sessions/${code}/${path}`, { method: "POST", body: JSON.stringify(body || {}) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  if (!snapshot) return <div className="glass rounded-lg p-6">Loading live dashboard...</div>;

  const question = snapshot.currentQuestion;
  const questionAnswers = question ? snapshot.answers.filter((answer) => answer.question_id === question.id) : [];
  const connected = snapshot.teams.filter((team) => team.connected).length;

  return (
    <section className="grid gap-5">
      <div className="glass rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Live Session</p>
            <h1 className="mt-1 text-4xl font-black">{snapshot.quiz.title}</h1>
            <p className="mt-2 text-white/65">Code {snapshot.session.code} · {snapshot.session.status}{offline ? " · reconnecting" : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary"><Link href={`/projector/${code}`} target="_blank"><MonitorPlay className="h-4 w-4" /> Projector</Link></Button>
            <Button onClick={() => action("start")}><Play className="h-4 w-4" /> Start</Button>
            <Button variant="secondary" onClick={() => action("pause", { paused: snapshot.session.status !== "paused" })}><Pause className="h-4 w-4" /> Pause</Button>
            <Button variant="secondary" onClick={() => action("advance", { reveal: true })}>Reveal</Button>
            <Button variant="secondary" onClick={() => action("advance")}><StepForward className="h-4 w-4" /> Next</Button>
            <Button variant="danger" onClick={() => action("restart")}><RotateCcw className="h-4 w-4" /> Restart</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Connected Teams" value={connected} icon={Users} />
        <Stat label="Answers Received" value={snapshot.stats.answersReceived} icon={BarChart3} />
        <Stat label="Correct" value={`${snapshot.stats.correctPercent}%`} icon={Trophy} />
        <Stat label="Avg Response" value={`${(snapshot.stats.averageResponseMs / 1000).toFixed(1)}s`} icon={BarChart3} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <div className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Question Analytics</h2>
            <span className="text-white/60">{snapshot.session.current_question_index + 1} / {snapshot.questions.length}</span>
          </div>
          <h3 className="text-xl font-bold">{question?.prompt || "Waiting to start"}</h3>
          <div className="mt-5 grid gap-3">
            {question?.options.map((option) => {
              const count = questionAnswers.filter((answer) => answer.answer === option).length;
              const width = questionAnswers.length ? (count / questionAnswers.length) * 100 : 0;
              return (
                <div key={option}>
                  <div className="mb-1 flex justify-between text-sm text-white/65"><span>{option}</span><span>{count}</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-300" style={{ width: `${width}%` }} /></div>
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <h3 className="mb-3 font-bold">Submissions</h3>
            <div className="grid gap-2">
              {questionAnswers.map((answer) => {
                const team = snapshot.teams.find((item) => item.id === answer.team_id);
                return <div key={answer.id} className="flex justify-between rounded-md bg-white/10 p-3 text-sm"><span>{team?.name}</span><span>{answer.is_correct ? "Correct" : "Incorrect"} · {(answer.response_ms / 1000).toFixed(1)}s</span></div>;
              })}
            </div>
          </div>
        </div>

        <aside className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Leaderboard</h2>
            <div className="flex gap-2">
              <Button asChild size="icon" variant="secondary"><a href={`/api/sessions/${code}/results?format=csv`}><Download className="h-4 w-4" /></a></Button>
              <Button asChild size="sm" variant="secondary"><a href={`/api/sessions/${code}/results?format=pdf`}>PDF</a></Button>
            </div>
          </div>
          <div className="grid gap-2">
            {snapshot.leaderboard.map((team, index) => (
              <div key={team.id} className="flex items-center justify-between rounded-md bg-white/10 p-3">
                <div><span className="mr-2 text-cyan-200">#{index + 1}</span>{team.name}<span className="ml-2 text-xs text-white/45">{team.connected ? "online" : "offline"}</span></div>
                <strong>{team.score}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
