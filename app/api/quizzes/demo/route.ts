import { demoQuiz } from "@/data/demo-quiz";
import { upsertQuiz } from "@/lib/db";
import { json, requireAdmin } from "@/lib/api";

export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return json(await upsertQuiz(demoQuiz));
}
