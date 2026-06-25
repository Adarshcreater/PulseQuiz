import { duplicateQuiz } from "@/lib/db";
import { json, requireAdmin } from "@/lib/api";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  return json(await duplicateQuiz(id));
}
