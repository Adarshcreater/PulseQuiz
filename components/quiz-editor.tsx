"use client";

import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Question, Quiz } from "@/lib/types";

type DraftQuestion = Partial<Question> & { options: string[] };

const blankQuestion = (): DraftQuestion => ({
  prompt: "",
  type: "multiple_choice",
  options: ["", "", "", ""],
  correct_answer: "",
  timer_seconds: 20,
  points: 1000,
  image_url: ""
});

export function QuizEditor({ existing }: { existing?: { quiz: Quiz; questions: Question[] } | null }) {
  const [title, setTitle] = useState(existing?.quiz.title || "");
  const [description, setDescription] = useState(existing?.quiz.description || "");
  const [status, setStatus] = useState(existing?.quiz.status || "draft");
  const [questions, setQuestions] = useState<DraftQuestion[]>(existing?.questions.length ? existing.questions : [blankQuestion()]);
  const [saving, setSaving] = useState(false);

  async function save(nextStatus = status) {
    setSaving(true);
    try {
      const payload = { title, description, status: nextStatus, questions };
      const url = existing ? `/api/quizzes/${existing.quiz.id}` : "/api/quizzes";
      const method = existing ? "PUT" : "POST";
      const saved = await api<{ quiz: Quiz }>(url, { method, body: JSON.stringify(payload) });
      toast.success(nextStatus === "published" ? "Quiz published" : "Quiz saved");
      if (!existing) window.location.href = `/admin/quizzes/${saved.quiz.id}`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((items) => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const next = [...questions[questionIndex].options];
    next[optionIndex] = value;
    updateQuestion(questionIndex, { options: next });
  }

  async function upload(index: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const data = await response.json();
    updateQuestion(index, { image_url: data.url, type: "image" });
  }

  return (
    <section className="grid gap-5">
      <div className="glass rounded-lg p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <Input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="focus-ring rounded-md border border-white/10 bg-slate-900 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <Textarea className="mt-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="mt-4 flex gap-2">
          <Button disabled={saving || !title} onClick={() => save("draft")}><Save className="h-4 w-4" /> Save Draft</Button>
          <Button disabled={saving || !title} variant="secondary" onClick={() => save("published")}>Publish Quiz</Button>
        </div>
      </div>

      {questions.map((question, questionIndex) => (
        <article key={questionIndex} className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">Question {questionIndex + 1}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setQuestions((items) => [...items.slice(0, questionIndex + 1), { ...question, options: [...question.options] }, ...items.slice(questionIndex + 1)])}>Duplicate</Button>
              <Button size="icon" variant="danger" onClick={() => setQuestions((items) => items.filter((_, i) => i !== questionIndex))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <Textarea placeholder="Question prompt" value={question.prompt} onChange={(e) => updateQuestion(questionIndex, { prompt: e.target.value })} />
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <select className="focus-ring rounded-md border border-white/10 bg-slate-900 px-3 text-sm" value={question.type} onChange={(e) => {
              const type = e.target.value as DraftQuestion["type"];
              updateQuestion(questionIndex, { type, options: type === "true_false" ? ["True", "False"] : question.options.length >= 4 ? question.options : ["", "", "", ""] });
            }}>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="image">Image Question</option>
              <option value="text">Text Question</option>
            </select>
            <Input type="number" min={5} value={question.timer_seconds} onChange={(e) => updateQuestion(questionIndex, { timer_seconds: Number(e.target.value) })} />
            <Input type="number" min={0} value={question.points} onChange={(e) => updateQuestion(questionIndex, { points: Number(e.target.value) })} />
            <label className="focus-ring inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 text-sm font-semibold">
              <ImagePlus className="h-4 w-4" /> Image
              <input hidden type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(questionIndex, e.target.files[0])} />
            </label>
          </div>
          {question.image_url ? <img alt="" src={question.image_url} className="mt-4 max-h-56 rounded-lg object-cover" /> : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(question.type === "text" ? [question.correct_answer || ""] : question.options).map((option, optionIndex) => (
              <Input
                key={optionIndex}
                placeholder={question.type === "text" ? "Accepted answer" : `Option ${optionIndex + 1}`}
                value={question.type === "text" ? question.correct_answer : option}
                onChange={(e) => question.type === "text" ? updateQuestion(questionIndex, { correct_answer: e.target.value, options: [e.target.value] }) : updateOption(questionIndex, optionIndex, e.target.value)}
              />
            ))}
          </div>
          {question.type !== "text" ? (
            <select className="focus-ring mt-3 h-11 w-full rounded-md border border-white/10 bg-slate-900 px-3 text-sm" value={question.correct_answer} onChange={(e) => updateQuestion(questionIndex, { correct_answer: e.target.value })}>
              <option value="">Correct answer</option>
              {question.options.filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : null}
        </article>
      ))}
      <Button variant="secondary" onClick={() => setQuestions((items) => [...items, blankQuestion()])}><Plus className="h-4 w-4" /> Add Question</Button>
    </section>
  );
}
