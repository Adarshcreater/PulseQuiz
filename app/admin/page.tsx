import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AppShell } from "@/components/shell";
import { isAdminAuthenticated } from "@/lib/auth";
import { listQuizzes } from "@/lib/db";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const quizzes = await listQuizzes();
  return (
    <AppShell>
      <AdminDashboard quizzes={quizzes} />
    </AppShell>
  );
}
