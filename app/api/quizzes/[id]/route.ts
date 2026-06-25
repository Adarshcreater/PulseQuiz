import { deleteQuiz, getQuiz, upsertQuiz } from "@/lib/db";
import { error, json, requireAdmin } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const quiz = await getQuiz(id);
  return quiz ? json(quiz) : error("Quiz not found", 404);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const body = await request.json();
  const saved = await upsertQuiz({ id, title: body.title, description: body.description || "", status: body.status || "draft", questions: body.questions || [] });
  return json(saved);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  await deleteQuiz(id);
  return json({ ok: true });
}
