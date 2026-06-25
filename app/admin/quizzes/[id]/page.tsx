import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { QuizEditor } from "@/components/quiz-editor";
import { isAdminAuthenticated } from "@/lib/auth";
import { getQuiz } from "@/lib/db";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const existing = await getQuiz(id);
  return <AppShell><QuizEditor existing={existing} /></AppShell>;
}
