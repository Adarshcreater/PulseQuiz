import { getQuiz } from "@/lib/db";
import { error, requireAdmin } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const quiz = await getQuiz(id);
  if (!quiz) return error("Quiz not found", 404);
  return new Response(JSON.stringify(quiz, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${quiz.quiz.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json"`
    }
  });
}
