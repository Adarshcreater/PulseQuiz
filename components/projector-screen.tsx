"use client";

import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Trophy, Users } from "lucide-react";
import { useLiveSession } from "@/lib/client";
import type { SessionSnapshot } from "@/lib/types";

export function ProjectorScreen({ code, initial }: { code: string; initial: SessionSnapshot | null }) {
  const { snapshot } = useLiveSession(code, initial);
  const [qr, setQr] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}/play/${code}`).then(setQr);
  }, [code]);

  const question = snapshot?.currentQuestion;
  const remaining = useMemo(() => {
    if (!snapshot?.session.question_started_at || !question) return question?.timer_seconds || 0;
    const elapsed = (now - new Date(snapshot.session.question_started_at).getTime()) / 1000;
    return Math.max(0, Math.ceil(question.timer_seconds - elapsed));
  }, [now, question, snapshot?.session.question_started_at]);

  if (!snapshot) return <FullScreen title="Loading session..." />;

  if (snapshot.session.status === "finished") {
    const top = snapshot.leaderboard.slice(0, 3);
    return (
      <FullScreen>
        <Confetti recycle={false} numberOfPieces={600} />
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto max-w-5xl text-center">
          <Trophy className="mx-auto mb-5 h-20 w-20 text-yellow-300" />
          <h1 className="text-6xl font-black">Quiz Finished</h1>
          <p className="mt-4 text-3xl text-cyan-200">Winning Team: {top[0]?.name || "No teams"}</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {top.map((team, index) => (
              <div key={team.id} className="glass rounded-lg p-6">
                <div className="text-5xl font-black">#{index + 1}</div>
                <div className="mt-3 text-2xl font-bold">{team.name}</div>
                <div className="mt-2 text-xl text-white/70">{team.score} pts</div>
              </div>
            ))}
          </div>
          <div className="mt-10 glass rounded-lg p-6 text-left">
            {snapshot.leaderboard.map((team, index) => (
              <div key={team.id} className="flex items-center justify-between border-b border-white/10 py-3 last:border-0">
                <span>{index + 1}. {team.name}</span>
                <span className="font-bold">{team.score}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </FullScreen>
    );
  }

  if (snapshot.session.status === "waiting") {
    return (
      <FullScreen>
        <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xl uppercase tracking-[0.35em] text-cyan-200">Join Code</p>
            <h1 className="mt-4 text-8xl font-black tracking-widest">{snapshot.session.code}</h1>
            <p className="mt-6 text-3xl text-white/75">Waiting for players</p>
            <div className="mt-8 flex items-center gap-3 text-2xl text-white/70"><Users /> {snapshot.teams.length} connected teams</div>
          </div>
          <div className="glass rounded-lg p-6 text-center">
            {qr ? <img alt="Join QR code" src={qr} className="mx-auto rounded-md bg-white p-3" /> : null}
            <p className="mt-4 text-lg text-white/65">{typeof window !== "undefined" ? `${window.location.origin}/play/${code}` : `/play/${code}`}</p>
          </div>
        </div>
      </FullScreen>
    );
  }

  return (
    <FullScreen>
      <AnimatePresence mode="wait">
        <motion.section key={question?.id} initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -28, opacity: 0 }} className="w-full max-w-7xl">
          <div className="mb-6 flex items-center justify-between text-2xl text-white/70">
            <span>Question {snapshot.session.current_question_index + 1} / {snapshot.questions.length}</span>
            <span className="rounded-md bg-white/10 px-5 py-2 text-4xl font-black text-cyan-200">{remaining}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-cyan-300 transition-all" style={{ width: `${((snapshot.session.current_question_index + 1) / snapshot.questions.length) * 100}%` }} />
          </div>
          {question?.image_url ? <img src={question.image_url} alt="" className="mx-auto mt-6 max-h-56 rounded-lg object-cover" /> : null}
          <h1 className="mt-8 text-center text-5xl font-black leading-tight">{question?.prompt}</h1>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {question?.options.map((option, index) => {
              const reveal = snapshot.session.status === "revealing";
              const correct = option === question.correct_answer;
              return (
                <div key={option} className={`rounded-lg border p-7 text-3xl font-bold ${reveal && correct ? "border-emerald-300 bg-emerald-400/25" : "border-white/10 bg-white/10"}`}>
                  <span className="mr-4 text-cyan-200">{["A", "B", "C", "D"][index]}</span>{option}
                </div>
              );
            })}
          </div>
        </motion.section>
      </AnimatePresence>
    </FullScreen>
  );
}

function FullScreen({ title, children }: { title?: string; children?: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center overflow-hidden px-8 py-10">{children || <h1 className="text-5xl font-black">{title}</h1>}</main>;
}
