import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { QuizEditor } from "@/components/quiz-editor";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function NewQuizPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AppShell><QuizEditor /></AppShell>;
}
