import { listQuizzes, upsertQuiz } from "@/lib/db";
import { error, json, requireAdmin } from "@/lib/api";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return json({ quizzes: await listQuizzes() });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json();
  if (!body.title) return error("Title is required");
  const saved = await upsertQuiz({
    title: body.title,
    description: body.description || "",
    status: body.status || "draft",
    questions: body.questions || []
  });
  return json(saved);
}
