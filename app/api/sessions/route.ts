import { createSession } from "@/lib/db";
import { error, json, requireAdmin } from "@/lib/api";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { quizId } = await request.json();
  if (!quizId) return error("quizId is required");
  return json({ session: await createSession(quizId) });
}
