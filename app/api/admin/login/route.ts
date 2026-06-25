import { createAdminSession, verifyAdminPassword } from "@/lib/auth";
import { error, json } from "@/lib/api";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (!verifyAdminPassword(password || "")) return error("Invalid password", 401);
  await createAdminSession();
  return json({ ok: true });
}
