import { upsertQuiz } from "@/lib/db";
import { json, requireAdmin } from "@/lib/api";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const quiz = body.quiz || body;
  const saved = await upsertQuiz({
    title: quiz.title,
    description: quiz.description || "",
    status: quiz.status || "draft",
    questions: body.questions || quiz.questions || []
  });
  return json(saved);
}
