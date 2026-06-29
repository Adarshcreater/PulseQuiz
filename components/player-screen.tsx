"use client";

import { motion } from "framer-motion";
import { Check, Loader2, WifiOff, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, useLiveSession } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SessionSnapshot, Team } from "@/lib/types";

export function JoinByCode() {
  const [code, setCode] = useState("");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="glass rounded-lg p-6">
        <h1 className="text-3xl font-black">Join Quiz</h1>
        <Input className="mt-5 text-center text-2xl uppercase tracking-widest" placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <Button className="mt-4 w-full" onClick={() => { if (code) window.location.href = `/play/${code}`; }}>Continue</Button>
      </div>
    </main>
  );
}

export function PlayerScreen({ code, initial }: { code: string; initial: SessionSnapshot | null }) {
  const { snapshot, offline } = useLiveSession(code, initial);
  const [team, setTeam] = useState<Team | null>(null);
  const [name, setName] = useState("");
  const [members, setMembers] = useState(1);
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [textAnswer, SetTextAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`team-${code}`);
    if (saved) setTeam(JSON.parse(saved));
  }, [code]);

  useEffect(() =>{
    setTextAnswer(""):
    setSubmittedQuestion("");
  },[snapshot?.currentQuestion?.id});

  const answered = submittedQuestion === snapshot?.currentQuestion?.id;
  const rank = useMemo(() => team && snapshot ? snapshot.leaderboard.findIndex((item) => item.id === team.id) + 1 : 0, [snapshot, team]);

  async function join() {
    try {
      setLoading(true);
      const response = await api<{ team: Team }>(`/api/sessions/${code}/join`, { method: "POST", body: JSON.stringify({ name, members }) });
      setTeam(response.team);
      localStorage.setItem(`team-${code}`, JSON.stringify(response.team));
      toast.success("Joined");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join");
    } finally {
      setLoading(false);
    }
  }

  async function answer(option: string) {
    if (!team || !snapshot?.currentQuestion || answered) return;
    try {
      setSubmittedQuestion(snapshot.currentQuestion.id);
      await api(
        '/api/sessions/${code}/answer',
        {
          method:"POST",
          body: JSON.stringify({
            teamID: team.id,
            answer: answerText
          })
        }
        };
        toast.success("Answer Submitted");
  }catch (err) {
    setSubmittedQuestion("");

    toast.error(
      err instanceof Error
      ? err.message
      :"Answer Failed"
      );
}


  if (!snapshot) return <PhoneFrame><Loader2 className="h-8 w-8 animate-spin" /></PhoneFrame>;
  if (!team) {
    return (
      <PhoneFrame>
        <div className="w-full glass rounded-lg p-5">
          <h1 className="text-2xl font-black">Team Setup</h1>
          <p className="mt-1 text-white/60">Code {code}</p>
          <Input className="mt-5" placeholder="Team name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input className="mt-3" type="number" min={1} max={20} value={members} onChange={(e) => setMembers(Number(e.target.value))} />
          <Button className="mt-4 w-full" disabled={!name || loading} onClick={join}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Join</Button>
        </div>
      </PhoneFrame>
    );
  }

  if (snapshot.session.status === "waiting") return <PhoneFrame><Waiting title="You're in" subtitle="Wait for the quiz to start." offline={offline} /></PhoneFrame>;
  if (snapshot.session.status === "paused") return <PhoneFrame><Waiting title="Paused" subtitle="The host will resume shortly." offline={offline} /></PhoneFrame>;
  if (snapshot.session.status === "finished") return <PhoneFrame><Waiting title="Finished" subtitle={`Final score: ${snapshot.leaderboard.find((item) => item.id === team.id)?.score || 0} pts. Rank #${rank || "-"}`} offline={offline} /></PhoneFrame>;

  const question = snapshot.currentQuestion;
  return (
    <PhoneFrame>
      {offline ? <div className="mb-3 flex items-center gap-2 text-sm text-yellow-200"><WifiOff className="h-4 w-4" /> Reconnecting</div> : null}
      <div className="w-full">
        <p className="text-sm text-white/60">Question {snapshot.session.current_question_index + 1}</p>
        <h1 className="mt-2 text-2xl font-black leading-tight">{question?.prompt}</h1>
        <div className="mt-5">
            {question?.type === "text" ? (
              <div className="space-y-3">
       <Input
       placeholder="Type your answer..."
       value={textAnswer}
       onChange={(e) => setTextAnswer(e.target.value)}
       disabled={answered}
     />
     <Button
       className="w-full"
       disabled={
         answered ||
         !textAnswer.trim() ||
         snapshot.session.status !== "running"
       }
       onClick={() => answer(textAnswer)}
     >
       Submit
     </Button>
   </div>
 ) : (
   <div className="grid gap-3">
     {question?.options.map((option) => (
       <Button
         key={option}
         disabled={
           answered ||
           snapshot.session.status !== "running"
         }
         variant="secondary"
         className="h-auto min-h-14 justify-start whitespace-normal py-4 text-left"
         onClick={() => answer(option)}
       >
         {option}
       </Button>
     ))}
   </div>
 )}
</div>
        {answered && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
className="mt-5 glass rounded-lg p-5 text-center"
>
<Loader2 className="mx-auto h-7 w-7 animate-spin"/>
<h3 className="mt-4 text-lg font-bold">
Answer Submitted
</h3>
<p className="mt-2 text-white/60">
Waiting for the host to reveal the answer...
</p>
</motion.div>
)}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-6">{children}</main>;
}

function Waiting({ title, subtitle, offline }: { title: string; subtitle: string; offline: boolean }) {
  return <div className="glass w-full rounded-lg p-6 text-center"><h1 className="text-3xl font-black">{title}</h1><p className="mt-3 text-white/65">{subtitle}</p>{offline ? <p className="mt-4 text-yellow-200">Reconnecting...</p> : null}</div>;
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-md bg-white/10 p-3"><div className="text-xs text-white/55">{label}</div><div className="font-black">{value}</div></div>;
}
